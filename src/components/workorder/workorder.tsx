import { useEffect, useState } from "react";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import axios from "axios";
import { ListIcon, PencilIcon, PlusIcon, TrashBinIcon } from "../../icons";
import {
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
} from "../ui/table";
import toast, { Toaster } from "react-hot-toast";
import Checkbox from "../form/input/Checkbox";

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
  const {
    isOpen: isDetailsModalOpen,
    openModal: openDetailsModal,
    closeModal: closeDetailsModal,
  } = useModal();

  const {
    isOpen: isEditModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const [customer, setCustomer] = useState("");
  const [hideSaveButton, setHideSaveButton] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workorders, setWorkorders] = useState([]);
  const [workorder, setWorkorder] = useState({});
  const [total, setTotal] = useState(0);
  const [paid, setPaid] = useState(0);
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getTodayFormatted());

  const [totalPaid, setTotalPaid] = useState(0);
  const [isDelivered, setIsDelivered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkorderId, setCurrentWorkorderId] = useState(null);
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

  const updateLineItem = (index: number, field: string, value: any) => {
    if (index < 0 || index >= lineItems.length) {
      console.error("Invalid index provided to updateLineItem:", index);
      return;
    }

    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Calculate total from updatedItems, ensuring numbers are properly handled
    const total = updatedItems.reduce((acc, item) => {
      const unitPrice = Number(item.unit_price) || 0;
      const quantity = Number(item.total_order) || 0;
      return acc + unitPrice * quantity;
    }, 0);

    setTotal(total);
    setLineItems(updatedItems);
  };

  const handleCloseModal = () => {
    closeModal();
    closeDetailsModal();
    closeEditModal();
    clearFormFields();
  };

  // clear form fields
  const clearFormFields = () => {
    setCustomer("");
    setDate("");
    setTotal(0);
    setPaid(0);
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
          params: {
            limit: 1000,
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

  const fetchWorkOrders = async (offset = 0, limit = 10, search = null) => {
    // setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/work-order/`,
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
      console.log("Fetched work orders:", response?.data?.data);
      setWorkorders(response?.data?.data || []);
      setPagination({
        total: response.data.total || 0,
        currentPage: Math.floor(offset / limit) + 1,
        limit,
        offset,
        prevUrl: response.data.prev_url,
        nextUrl: response.data.next_url,
      });
    } catch (error) {
      console.error("Failed to fetch work orders", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleSearch = (searchResult) => {
    setSearch(searchResult);
    fetchWorkOrders(0, pagination.limit, searchResult);
  };

  const handlePageChange = (newOffset) => {
    fetchWorkOrders(newOffset, pagination.limit, search);
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

  // This useEffect will run whenever customers state changes
  useEffect(() => {}, [customers]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here
    try {
      if (isEditing && currentWorkorderId) {
        const updateWorkorderData: any = {};
        updateWorkorderData.is_delivered = isDelivered;
        if (totalPaid) {
          updateWorkorderData.total_paid = totalPaid;
        }
        // Update existing workorder
        await axios.put(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/work-order/${currentWorkorderId}/`,
          updateWorkorderData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Workorder Updated Successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/work-order/`,
          {
            customer: customer,
            items: lineItems,
            amount: total,
            total_paid: paid,
            date: date || new Date().toISOString().split("T")[0],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Workorder Created Successfully");
      }

      closeModal();
      closeEditModal();
      clearFormFields();
      fetchWorkOrders();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create workorder");
    }
  };

  const handleView = async (id: number) => {
    // Handle view logic here
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/work-order/${id}/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
    setWorkorder(response?.data?.data);
    openDetailsModal();
  };

  const handleEdit = (id: number) => {
    const workorder = workorders.find((w) => w.id === id);
    if (workorder) {
      // Set form fields with customer data
      setTotalPaid(0);
      setIsDelivered(workorder?.is_delivered);
      setIsEditing(true);
      setCurrentWorkorderId(id);
    }
    openEditModal();
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
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              Workorder Details
            </h3>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <div className="mt-2">
              <div className="flex justify-center">
                <div className="w-1/3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    No
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workorder?.no}
                  </p>
                </div>
                <div className="w-1/3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Customer
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workorder?.customer?.name}
                  </p>
                </div>
                <div className="w-1/3">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Created
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workorder?.created}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Ordered Items
              </label>
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Item
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
                      Quantity
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Unit Price
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {workorder?.items?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.item}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.details}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.total_order}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.unit_price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Summary
              </label>
            </div>
            <div className="flex justify-center gap-3 border p-3">
              <div className="mt-5 w-1/4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Total
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workorder?.amount}
                </p>
              </div>
              <div className="mt-5 w-1/4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Paid
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workorder?.total_paid}
                </p>
              </div>
              <div className="mt-5 w-1/4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Expense
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workorder?.expense?.[0]?.total || 0}
                </p>
              </div>
              <div className="mt-5 w-1/4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Profit
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {workorder?.amount -
                    workorder?.total_paid -
                    workorder?.expense?.[0]?.total || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
            <div className="flex flex-col gap-1 mt-2 justify-center">
              <div className="flex flex-col gap-1 mt-2 justify-between">
                <div className="flex flex-row gap-4 mt-2">
                  <div className="mt-2 flex-1">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Customers
                        </label>
                        <select
                          value={customer}
                          onChange={(e) => setCustomer(e.target.value)}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          required
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
                  <div className="mt-2 flex-1">
                    <div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                          Date
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {lineItems.map((lineItem, index) => (
                <div className="flex flex-row gap-1 mt-2" key={index}>
                  <div className="flex mt-2 w-1/5">
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

                  <div className="mt-2 w-1/4">
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

                  <div className="mt-2 w-1/5">
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

                  <div className="mt-2 w-1/5">
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

                  <div className="mt-10 w-1/7">
                    <div className="flex gap-2 ">
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
              <div className="flex gap-2">
                <div className="mt-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Total
                  </label>
                  <input
                    type="number"
                    value={total}
                    onChange={(e) => setTotal(parseFloat(e.target.value))}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    disabled
                  />
                </div>
                <div className="mt-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Paid
                  </label>
                  <input
                    type="number"
                    value={paid}
                    onChange={(e) => setPaid(parseFloat(e.target.value))}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
                <div className="mt-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Net
                  </label>
                  <input
                    type="number"
                    value={total - paid}
                    className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    disabled
                  />
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        className="max-w-[400px] p-6 lg:p-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-semibold text-gray-800 dark:text-white/90">
              Update Workorder
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Paid
                </label>
                <input
                  type="number"
                  value={totalPaid}
                  onChange={(e) => setTotalPaid(parseFloat(e.target.value))}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Is Delivered
                </label>
                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Is Delivered
                  </label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isDelivered}
                      onChange={(checked) => {
                        const boolValue = Boolean(checked);
                        console.log("Sending to backend:", boolValue);
                        setIsDelivered(boolValue);
                      }}
                      label="Delivered"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 w-full"
                >
                  <span>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              openModal();
            }}
          >
            Create Workorder
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
                    Total / Paid / Net
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Delivered
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created
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
                        {workorder?.customer} ({workorder?.total_items})
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.amount || "n/a"} / {workorder?.total_paid} /{" "}
                        {parseFloat(workorder?.amount) -
                          parseFloat(workorder?.total_paid) || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.is_delivered ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {workorder?.date || "n/a"}
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
                          onClick={() => handleEdit(workorder?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <PencilIcon />
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
