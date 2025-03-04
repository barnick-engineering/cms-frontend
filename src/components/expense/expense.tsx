import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import axios from "axios";
import { ListIcon, TrashBinIcon } from "../../icons";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [hideSaveButton, setHideSaveButton] = useState(false);
  const [customer, setCustomer] = useState(0);
  const [workorder, setWorkorder] = useState(0);
  const [paidBy, setPaidBy] = useState(0);
  const [purpose, setPurpose] = useState("");
  const [amount, setAmount] = useState(0);

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
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setContactPersonName("");
    setHideSaveButton(false);
  };

  const fetchExpenses = async () => {
    // setLoading(true);
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
    } finally {
      // setLoading(false);
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
    // setLoading(true);
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
    } finally {
      // setLoading(false);
    }
  };

  const fetchWorkorders = async () => {
    // setLoading(true);
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
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchUsers();
    fetchCustomers();
    fetchWorkorders();
  }, []);

  // This useEffect will run whenever customers state changes
  useEffect(() => {}, [customers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearFormFields();
    openModal();
    // Handle form submission here
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/expense/`,
        {
          customer,
          work_order: workorder,
          paid_by: paidBy,
          purpose,
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      closeModal();
      fetchExpenses();
      // fetch customers
      fetchCustomers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleView = (id: string) => {
    // Handle view logic here
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      // Set form fields with customer data
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      setAddress(customer.address);
      setContactPersonName(customer.contactPersonName);
    }
    openModal();
    // but save button should be disabled
    setHideSaveButton(true);
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
              Create Expense
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
                      value={customer}
                      onChange={(e) => setCustomer(parseInt(e.target.value))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                      value={workorder}
                      onChange={(e) => setWorkorder(parseInt(e.target.value))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                    <input
                      id="event-title"
                      type="text"
                      value={purpose}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setPurpose(e.target.value)}
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
                      onChange={(e) => setAmount(parseInt(e.target.value))}
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
                      onChange={(e) => setPaidBy(parseInt(e.target.value))}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    >
                      <option value="">Select Paid By</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 w-full"
                  hidden={hideSaveButton}
                >
                  <span>Save</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
      <Button onClick={openModal}>Create Expense</Button>

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
                    purpose
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    disbursement date
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
                        {expense.client}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.workorder}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.purpose.length > 30
                          ? expense.purpose.slice(0, 30) + "..."
                          : expense.purpose}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {expense.amount}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleView(expense?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <ListIcon />
                        </button>
                        {/* <button
                          type="button"
                          onClick={() => handleEdit(expense?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <PencilIcon />
                        </button> */}
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
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
