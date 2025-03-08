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

export default function Customer() {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [hideSaveButton, setHideSaveButton] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);

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
    setIsEditing(false);
    setIsViewOnly(false);
    setCurrentCustomerId(null);
  };

  const fetchCustomers = async (offset = 0, limit = 10, search = null) => {
    // setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/customer/`,
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
      setPagination({
        total: response.data.total || 0,
        currentPage: Math.floor(offset / limit) + 1,
        limit,
        offset,
        prevUrl: response.data.prev_url,
        nextUrl: response.data.next_url,
      });
      console.log("Fetched customers:", customersData);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      toast.error("Failed to fetch customers");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // This useEffect will run whenever customers state changes
  useEffect(() => {}, [customers]);

  const handleSearch = (searchResult) => {
    setSearch(searchResult);
    fetchCustomers(0, pagination.limit, searchResult);
  };

  const handlePageChange = (newOffset) => {
    fetchCustomers(newOffset, pagination.limit);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Handle form submission here
    try {
      if (isEditing && currentCustomerId) {
        // Update existing customer
        const customerData: any = {};

        if (name) {
          customerData.name = name;
        }

        if (email) {
          customerData.email = email;
        }

        if (phone) {
          customerData.phone = phone;
        }

        if (address) {
          customerData.address = address;
        }

        if (contactPersonName) {
          customerData.contact_person_name = contactPersonName;
        }
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/customer/${currentCustomerId}/`,
          customerData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Customer updated successfully");
      } else {
        // Create new customer
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/customer/`,
          {
            name: name,
            email: email,
            phone: phone,
            address: address,
            contact_person_name: contactPersonName,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Customer created successfully");
      }

      closeModal();
      // fetch customers
      fetchCustomers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleView = (id: number) => {
    setIsViewOnly(true);
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

  const handleEdit = (id: number) => {
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      // Set form fields with customer data
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone);
      setAddress(customer.address);
      setContactPersonName(customer.contactPersonName);
      setIsEditing(true);
      setCurrentCustomerId(id);
    }
    openModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/customer/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      fetchCustomers();
      toast.success("Customer deleted successfully");
    } catch (error) {
      toast.error("Customer associated workorder or expense exist");
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {isEditing
                ? "Edit Customer"
                : isViewOnly
                ? "View Customer"
                : "Add Customer"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mt-2 justify-between">
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Name
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={name}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Phone
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={phone}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Email
                    </label>
                    <input
                      id="event-title"
                      type="email"
                      value={email}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      address
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={address}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Contact Person Name
                    </label>
                    <input
                      id="event-title"
                      type="text"
                      value={contactPersonName}
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      onChange={(e) => setContactPersonName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 w-full"
                  hidden={hideSaveButton}
                >
                  <span>{isEditing ? "Update" : "Create"}</span>
                </button>
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
            Create Customer
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
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Address
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Contact Person Name
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id || "n/a"}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {customer.name || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {customer.phone || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {customer.email || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {customer.address.length > 30
                          ? customer.address.slice(0, 30) + "..."
                          : customer.address}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {customer.contactPersonName || "n/a"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleView(customer?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <ListIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(customer?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer?.id)}
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
