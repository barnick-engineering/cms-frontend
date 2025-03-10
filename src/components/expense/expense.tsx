import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import axios from "axios";
import { ListIcon, PencilIcon, TrashBinIcon } from "../../icons";
import toast, { Toaster } from "react-hot-toast";
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
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [expenseDate, setExpenseDate] = useState(getTodayFormatted());

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workorders, setWorkorders] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: 10,
    offset: 0,
    prevUrl: null,
    nextUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const fetchExpenses = async (offset = 0, limit = 10, search = null) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/expense/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          params: {
            offset,
            limit,
            search,
          },
        }
      );

      setExpenses(response.data.data || []);
      setPagination({
        total: response.data.total || 0,
        currentPage: Math.floor(offset / limit) + 1,
        limit,
        offset,
        prevUrl: response.data.prev_url,
        nextUrl: response.data.next_url,
      });
      console.log("Fetched expenses:", response.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
      toast.error("Failed to fetch expenses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchResult) => {
    setSearch(searchResult);
    fetchExpenses(0, pagination.limit, searchResult);
  };

  const handlePageChange = (newOffset) => {
    fetchExpenses(newOffset, pagination.limit);
  };

  const handlePrevPage = () => {
    if (pagination.prevUrl) {
      handlePageChange(pagination.offset - pagination.limit);
    }
  };

  const handleNextPage = () => {
    if (pagination.nextUrl) {
      handlePageChange(pagination.offset + pagination.limit);
    }
  };

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

    if (expenseDate) {
      expenseData.expense_date =
        expenseDate || new Date().toISOString().split("T")[0];
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
        toast.success("Expense updated successfully");
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
        toast.success("Expense created successfully");
      }

      closeModal();
      fetchExpenses();
      clearFormFields();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save expense");
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
      setAmount(expense?.amount);
      setExpenseDate(expense?.expense_date);
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
      setExpenseDate(
        expense?.expense_date || new Date().toISOString().split("T")[0]
      );
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
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete expense");
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
    { id: "dye cut", name: "Dye Cut" },
    { id: "printing", name: "Printing" },
    { id: "packing", name: "Packing" },
    { id: "pasting", name: "Pasting" },
    { id: "spot lamination", name: "Spot Lamination" },
    { id: "matt lamination", name: "Matt Lamination" },
    { id: "glossy lamination", name: "Glossy Lamination" },
    { id: "other", name: "Other" },
  ];

  return (
    <div>
      <Toaster position="bottom-right" />
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
                      Customer
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
                      Work Order
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
                      required
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
                      required
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
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Expense Date
                    </label>
                    <input
                      value={expenseDate}
                      type="date"
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                      required
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
                      required
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              clearFormFields();
              openModal();
            }}
          >
            Create Expense
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            className="p-2 rounded border border-gray-500 shadow dark:bg-dark-900 text-black dark:text-white dark:border-gray-700"
            placeholder="Search....."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
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
                    Date
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
                        {expense?.details && expense?.details?.length > 10
                          ? expense?.details.slice(0, 10) + "..."
                          : expense?.details || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense?.amount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense?.expense_date}
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
            {/* Pagination Controls */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/[0.05] px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={handlePrevPage}
                    disabled={!pagination.prevUrl}
                    className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      pagination.prevUrl
                        ? "text-gray-700 bg-white hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                        : "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.nextUrl}
                    className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      pagination.nextUrl
                        ? "text-gray-700 bg-white hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
                        : "text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{" "}
                      <span className="font-medium">
                        {pagination.offset + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.offset + pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      of <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={handlePrevPage}
                        disabled={!pagination.prevUrl}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                          pagination.prevUrl
                            ? "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          // Logic to show pagination buttons around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            // If 5 or fewer pages, show all page numbers
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            // If near the start, show first 5 pages
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= totalPages - 2) {
                            // If near the end, show last 5 pages
                            pageNum = totalPages - 4 + i;
                          } else {
                            // Otherwise, show 2 pages before and after current page
                            pageNum = pagination.currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() =>
                                handlePageChange(
                                  (pageNum - 1) * pagination.limit
                                )
                              }
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                pageNum === pagination.currentPage
                                  ? "z-10 bg-brand-500 text-white dark:bg-brand-600"
                                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.nextUrl}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                          pagination.nextUrl
                            ? "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
