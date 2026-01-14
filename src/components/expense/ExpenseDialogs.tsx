import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import ExpenseMutateDrawer from "./ExpenseMutateDrawer"
import ExpenseViewDrawer from "./ExpenseViewDrawer"
import { useDeleteExpense } from "@/hooks/useExpense"
import { useExpense } from "./expense-provider"
import { useDrawerStore } from "@/stores/drawerStore"
import { useShopStore } from "@/stores/shopStore"

export default function ExpenseDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useExpense()

    const shopId = useShopStore((s) => s.currentShopId)

    const deleteMutation = useDeleteExpense()

    // global drawer state (background blur)
    const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

    return (
        <>
            {/* Create drawer */}
            <ExpenseMutateDrawer
                key="expense-create"
                open={open === "create"}
                onOpenChange={(val) => setOpen(val ? "create" : null)}
                onSave={() => setOpen(null)}
            />

            {/* View / Update / Delete */}
            {currentRow && (
                <>
                    {/* View drawer */}
                    <ExpenseViewDrawer
                        key={`expense-view-${currentRow.id}`}
                        open={open === "view"}
                        onOpenChange={(val: boolean) => {
                            setOpen(val ? "view" : null)
                            setDrawerOpen(val)
                        }}
                        currentRow={currentRow}
                    />

                    {/* Update drawer */}
                    <ExpenseMutateDrawer
                        key={`expense-update-${currentRow.id}`}
                        open={open === "update"}
                        onOpenChange={(val: boolean) => setOpen(val ? "update" : null)}
                        currentRow={{
                            ...currentRow,
                            shopId: currentRow.shopId ?? shopId ?? "",
                        }}
                        onSave={() => setOpen(null)}
                    />

                    {/* Delete dialog */}
                    <ConfirmDialog
                        key="expense-delete"
                        destructive
                        open={open === "delete"}
                        onOpenChange={(val: boolean) => setOpen(val ? "delete" : null)}
                        handleConfirm={() => {
                            if (!currentRow) return

                            deleteMutation.mutate(
                                { id: currentRow.id },
                                {
                                    onSuccess: () => {
                                        setOpen(null)
                                        setCurrentRow(null)
                                        toast.success("The expense has been deleted successfully")
                                    },
                                }
                            )
                        }}
                        className="max-w-md"
                        title={`Delete this expense: ${currentRow.title} ?`}
                        desc={
                            <>
                                You are about to delete an expense titled{" "}
                                <strong>{currentRow.title}</strong>.
                                <br />
                                This action cannot be undone.
                            </>
                        }
                        confirmText="Delete"
                    />
                </>
            )}
        </>
    )
}