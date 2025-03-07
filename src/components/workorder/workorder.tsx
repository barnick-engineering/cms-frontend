import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import axios from "axios";
import { ListIcon, PlusIcon, TrashBinIcon } from "../../icons";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
} from "../ui/table";
import toast, { Toaster } from "react-hot-toast";

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

export default function Workorder() {
  const { isOpen, openModal, closeModal } = useModal();
  const [customer, setCustomer] = useState("");
  const [hideSaveButton, setHideSaveButton] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workorders, setWorkorders] = useState([]);

  // Create an array of line items instead of individual state variables
  const [lineItems, setLineItems] = useState([
    { item: "", details: "", unit_price: "", total_order: "" },
  ]);

  // Function to add a new row
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { item: "", details: "", unit_price: "", total_order: "" },
    ]);
  };

  // Function to remove a row by index
  const removeLineItem = (index: any) => {
    // Don't remove if it's the last remaining row
    if (lineItems.length <= 1) return;

    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
  };

  const updateLineItem = (index: any, field: any, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setLineItems(updatedItems);
  };

  const handleCloseModal = () => {
    closeModal();
    clearFormFields();
  };

  // clear form fields
  const clearFormFields = () => {
    setCustomer("");
    setLineItems([{ item: "", details: "", unit_price: "", total_order: "" }]);
    setHideSaveButton(false);
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchWorkOrders = async () => {
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
    fetchWorkOrders();
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
        `${import.meta.env.VITE_BACKEND_URL}/work-order/`,
        {
          customer: customer,
          items: lineItems,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      closeModal();
      clearFormFields();
      fetchWorkOrders();
      toast.success("Workorder created successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create workorder");
    }
  };

  const handleView = (id: string) => {
    // Handle view logic here
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      // Set form fields with customer data
    }
    openModal();
    // but save button should be disabled
    setHideSaveButton(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/work-order/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      fetchWorkOrders();
      toast.success("Workorder deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete workorder");
    }
  };

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
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create Workorder
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 mt-2 justify-between">
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Customers
                    </label>
                    <select
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
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
              {lineItems.map((lineItem, index) => (
                <div className="flex flex-row gap-1 mt-2" key={index}>
                  <div className="flex mt-2">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Item
                        </label>
                        <input
                          type="text"
                          value={lineItem.item}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          onChange={(e) =>
                            updateLineItem(index, "item", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 w-1/5">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          details
                        </label>
                        <input
                          type="text"
                          value={lineItem.details}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          onChange={(e) =>
                            updateLineItem(index, "details", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 w-1/4">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20000000000"
                          step={"0.01"}
                          value={lineItem.unit_price}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          onChange={(e) =>
                            updateLineItem(index, "unit_price", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 w-1/4">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={"0.01"}
                          max="20000000000"
                          value={lineItem.total_order}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          onChange={(e) =>
                            updateLineItem(index, "total_order", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="flex gap-2">
                      {/* Only show plus button on the last row */}
                      {index === lineItems.length - 1 && (
                        <button
                          type="button"
                          onClick={addLineItem}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded dark:text-white"
                        >
                          <PlusIcon />
                        </button>
                      )}

                      {/* Show delete button if there's more than one row */}
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded dark:text-white"
                        >
                          <TrashBinIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={openModal}>Create Workorder</Button>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search" />
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
                    Total Items
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Total paid
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Remaining
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Delivered
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {workorders.length > 0 ? (
                  workorders.map((workorder) => (
                    <TableRow key={workorder?.id || "n/a"}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.no || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.customer}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.total_items}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.amount || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.total_paid}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {parseFloat(workorder?.amount) -
                          parseFloat(workorder?.total_paid) || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.is_delivered ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleView(workorder?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <ListIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(workorder?.id)}
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
                      No customers found
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
