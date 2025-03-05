import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import axios from "axios";
import { ListIcon, PencilIcon, TrashBinIcon } from "../../icons";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
} from "../ui/table";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPersonName: string;
  remarks: string;
  status: boolean;
}

export default function Expense() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [customer, setCustomer] = useState<number | null>(null);
  const [workorder, setWorkorder] = useState<number | null>(null);
  const [paidBy, setPaidBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workorders, setWorkorders] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const handleCloseModal = () => {
    closeModal();
    clearFormFields();
  };

  // clear form fields
  const clearFormFields = () => {
    setCustomer(null);
    setWorkorder(null);
    setPaidBy("");
    setPurpose("");
    setDetails("");
    setAmount("");
    setIsEditing(false);
    setIsViewOnly(false);
    setCurrentExpenseId(null);
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/expense/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setExpenses(response?.data?.data);
      console.log("Fetched expenses:", response.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/account/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      console.log("Fetched users:", response?.data?.data);
      setUsers(response?.data?.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/customer/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      // Ensure we're setting an array
      let customersData = Array.isArray(response.data)
        ? response.data
        : response.data.results || response.data.data || [];

      // Map the snake_case to camelCase
      customersData = customersData.map((customer: any) => ({
        ...customer,
        contactPersonName: customer.contact_person_name,
      }));

      setCustomers(customersData);
      console.log("Fetched customers:", customersData);
    } catch (error) {
      console.error("Failed to fetch customers", error);
    }
  };

  const fetchWorkorders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/work-order/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      console.log("Fetched work orders:", response?.data?.data);
      setWorkorders(response?.data?.data);
    } catch (error) {
      console.error("Failed to fetch work orders", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
    fetchCustomers();
    fetchWorkorders();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build expense data object, omitting optional fields if they're not set
    const expenseData: any = {
      paid_by: paidBy,
      purpose,
      details,
      amount,
    };

    // Only add customer and work_order if they have values
    if (customer) {
      expenseData.customer = customer;
    }

    if (workorder) {
      expenseData.work_order = workorder;
    }

    try {
      if (isEditing && currentExpenseId) {
        // Update existing expense
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/expense/${currentExpenseId}/`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
      } else {
        // Create new expense
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/expense/`,
          expenseData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
      }

      closeModal();
      fetchExpenses();
      clearFormFields();
    } catch (e) {
      console.error("Error saving expense:", e);
    }
  };

  const handleView = (id: number) => {
    const expense = expenses.find((e) => e?.id === id);
    if (expense) {
      // Set form fields with expense data
      setCustomer(expense.customer || null);
      setWorkorder(expense.work_order || null);
      setPaidBy(expense?.paid_by);
      setPurpose(expense?.purpose);
      setDetails(expense?.details);
      setAmount(expense.amount);
      setIsViewOnly(true);
      setCurrentExpenseId(id);
    }
    openModal();
  };

  const handleEdit = (id: number) => {
    const expense = expenses.find((e) => e?.id === id);
    if (expense) {
      // Set form fields with expense data
      setCustomer(expense.customer || null);
      setWorkorder(expense.work_order || null);
      setPaidBy(expense.paid_by || "");
      setPurpose(expense.purpose || "");
      setDetails(expense.details || "");
      setAmount(expense.amount?.toString() || "");
      setIsEditing(true);
      setCurrentExpenseId(id);
    }
    openModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/expense/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  // purpose type
  const purposeTypes = [
    { id: "making", name: "Making" },
    { id: "material", name: "Material" },
    { id: "labour", name: "Labour" },
    { id: "transport", name: "Transport" },
    { id: "meeting", name: "Meeting" },
    { id: "design", name: "Design" },
    { id: "dying", name: "Dying" },
    { id: "printing", name: "Printing" },
    { id: "packing", name: "Packing" },
    { id: "pasting", name: "Pasting" },
    { id: "other", name: "Other" },
  ];

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {isEditing
                ? "Edit Expense"
                : isViewOnly
                ? "View Expense"
                : "Create Expense"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mt-2 justify-between">
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Customer (Optional)
                    </label>
                    <select
                      value={customer || ""}
                      onChange={(e) =>
                        setCustomer(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Work Order (Optional)
                    </label>
                    <select
                      value={workorder || ""}
                      onChange={(e) =>
                        setWorkorder(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                    >
                      <option value="">Select Work Order</option>
                      {workorders.map((workorder) => (
                        <option key={workorder.id} value={workorder.id}>
                          {workorder.no} {workorder.customer}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Purpose
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                    >
                      <option value="">Select Purpose Type</option>
                      {purposeTypes.map((purpose) => (
                        <option key={purpose?.id} value={purpose?.name}>
                          {purpose?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Details
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={details}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setDetails(e.target.value)}
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Amount
                    </label>
                    <input
                      id="event-title"
                      type="number"
                      value={amount}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) =>
                        setAmount(e.target.value ? e.target.value : "")
                      }
                      disabled={isViewOnly}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Paid By
                    </label>
                    <select
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                    >
                      <option value="">Select Paid By</option>
                      {users.map((user) => (
                        <option key={user?.id} value={user?.id}>
                          {user?.first_name} {user?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                {!isViewOnly && (
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 w-full"
                  >
                    <span>{isEditing ? "Update" : "Save"}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </Modal>
      <Button
        onClick={() => {
          clearFormFields();
          openModal();
        }}
      >
        Create Expense
      </Button>

      <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    No
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Workorder
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Purpose
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Details
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Paid By
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense?.id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.no}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.client || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.workorder || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.purpose}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense?.details && expense?.details?.length > 30
                          ? expense?.details.slice(0, 30) + "..."
                          : expense?.details || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.amount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.cost_paid_by}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleView(expense?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg mr-2"
                        >
                          <ListIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(expense?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg mr-2"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(expense?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <TrashBinIcon />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
