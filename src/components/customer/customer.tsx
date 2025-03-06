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
      <Toaster
        position="bottom-right"
      />
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
      <Button
        onClick={() => {
          openModal();
          clearFormFields();
        }}
      >
        Create Customer
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
          </div>
        </div>
      </div>
    </div>
  );
}
