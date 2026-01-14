import { z } from "zod"

// inventory required transaction types
const inventoryRequiredTypes = ["PURCHASE", "SALE"]

// helper function to safely transform string/empty string/number input into a final number or 0
const zNumberOrZero = z
  .union([z.string(), z.number()])
  .transform((val) => {
    // if it's an empty string, treat it as 0 to satisfy RHF default values (when added)
    if (typeof val === "string" && val.trim() === "") return 0
    // otherwise, convert it to a number. ff conversion fails, zod will catch it later.
    return Number(val)
  })
  // ensure the output is enforced as a number for RHF
  .pipe(z.number().min(0, { message: "Value must be 0 or greater." }))

// helper function to safely transform string/empty string/number input into a final number or null
const zAmountOrNull = z
  .union([z.string(), z.number()])
  .transform((val) => {
    // if it's an empty string or null, return null
    if (val === null || (typeof val === "string" && val.trim() === "")) return null
    // otherwise, convert it to a number.
    return Number(val)
  })
  // ensure the output is enforced as a number or null
  .pipe(z.nullable(z.number()))

export const transactionFormSchema = z
  .object({
    partnerType: z.string().min(1, "Please select a partner type"),

    // these are required fields in the UI flow after selection, even if optional in zod for initial render
    entityTypeId: z.string().min(1, "Please select an entity type"),
    transactionType: z.string().min(1, "Please select a transaction type"),

    // use the helper for nullable amount
    transactionAmount: zAmountOrNull
      .refine((val) => val === null || val > 0, {
        message: "Amount must be positive",
      })
      .nullable() // must be nullable/optional for non-inventory types
      .optional(),
    paymentType: z.string().min(1, "Please select a payment type"),
    remarks: z.string().optional(),
    paid: zNumberOrZero,
    // array of inventories for dynamic rows
    inventories: z
      .array(
        z.object({
          inventoryId: z.string().min(1, "Select inventory"),
          // Use zNumberOrZero helper for quantity and price
          quantity: zNumberOrZero.refine((val) => val > 0, { message: "Quantity must be greater than 0" }),
          price: zNumberOrZero.refine((val) => val > 0, { message: "Price must be greater than 0" }),
        })
      )
      // must use default([]) to ensure RHF sees this as a required array, not optional
      .default([]),
  })
  .refine(
    (data) => {
      // conditional refinement for inventory-based transactions
      if (
        data.transactionType &&
        inventoryRequiredTypes.includes(data.transactionType)
      ) {
        // all inventory items must have valid data if any exist
        // first check if there are any inventory items at all
        if (data.inventories.length === 0) {
          return false
        }

        // check that all items are complete
        return data.inventories.every(
          (item) => item.inventoryId.length > 0 && item.quantity > 0 && item.price > 0
        )
      }
      return true
    },
    {
      path: ["inventories"],
      message: "Please add at least one inventory item with a positive quantity and price.",
    }
  )
  // schema for checkoing qty is larger than stock or not for sale
  .refine(
    (data) => {
      if (data.transactionType === "SALE") {
        // This is a structural check. 
        // Note: Actual stock value validation usually happens in the component 
        // or via a custom context because the schema doesn't know "current stock" 
        // unless passed in.
        return data.inventories.every((item) => item.quantity > 0);
      }
      return true;
    },
    { path: ["inventories"], message: "Invalid quantity for sale." }
  )
  .refine(
    (data) => {
      // conditional refinement for non-inventory-based transactions (PAYMENT, COMMISSION, SALE)
      if (
        data.transactionType &&
        !inventoryRequiredTypes.includes(data.transactionType)
      ) {
        // amount must be present and greater than 0
        return data.transactionAmount !== null && data.transactionAmount !== undefined && data.transactionAmount > 0
      }
      return true
    },
    {
      path: ["transactionAmount"],
      message: "Transaction amount is required for this type.",
    }
  )

// export the inferred type, which will now correctly show 'inventories' as an array of objects
// with quantity and price as 'number'
export type TransactionFormValues = z.infer<typeof transactionFormSchema>