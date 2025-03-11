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

type Product = {
  id: number;
  name: string;
  details: string;
  price: number;
};

export default function Product() {
  const { isOpen, openModal, closeModal } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | undefined>(
    undefined
  );
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [price, setPrice] = useState<number>();

  const [products, setProducts] = useState<Product[]>([]);
  const [, setSearch] = useState("");

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: 10,
    offset: 0,
    prevUrl: null,
    nextUrl: null,
  });
  const [, setIsLoading] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const fetchProducts = async (offset = 0, limit = 10, search = null) => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/product/`,
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

      setProducts(response.data.data || []);
      setPagination({
        total: response.data.total || 0,
        currentPage: Math.floor(offset / limit) + 1,
        limit,
        offset,
        prevUrl: response.data.prev_url,
        nextUrl: response.data.next_url,
      });
      console.log("Fetched products:", response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchResult: any) => {
    setSearch(searchResult);
    fetchProducts(0, pagination.limit, searchResult);
  };

  const handlePageChange = (newOffset: number) => {
    fetchProducts(newOffset, pagination.limit, null);
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
    setName("");
    setDetails("");
    setPrice(0); // Reset to a number
    setIsEditing(false);
    setIsViewOnly(false);
    setCurrentProductId(undefined); // Corrected type here
  };

  useEffect(() => {
    fetchProducts(0, pagination.limit, null);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Build product data object, omitting optional fields if they're not set
    const productData: Partial<Product> = {};

    // Only add fields if they have values
    if (name) {
      productData.name = name;
    }

    if (details) {
      productData.details = details;
    }

    if (price) {
      productData.price = price;
    }

    try {
      if (isEditing && currentProductId) {
        // Update existing product
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/product/${currentProductId}/`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/product/`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        toast.success("Product created successfully");
      }

      closeModal();
      fetchProducts(0, pagination.limit, null);
      clearFormFields();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save product");
    }
  };

  const handleView = (id: number) => {
    const product = products.find((p: Product) => p?.id === id);
    if (product) {
      // Set form fields with product data
      setName(product?.name);
      setDetails(product?.details);
      setPrice(product?.price);
      setIsViewOnly(true);
      setCurrentProductId(id);
    }
    openModal();
  };

  const handleEdit = (id: number) => {
    const product = products.find((p: Product) => p.id === id);
    if (product) {
      setName(product.name);
      setDetails(product.details);
      setPrice(product.price); // Ensure that price is always a number
      setIsEditing(true);
      setCurrentProductId(id); // this should be fine as `id` is a number
    }
    openModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/product/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      fetchProducts(0, pagination.limit, null);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
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
                ? "Edit Product"
                : isViewOnly
                ? "View Product"
                : "Create Product"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 mt-2 justify-between">
              <div className="mt-2">
                <div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      Product
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Product name"
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
                      Details
                    </label>
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Description"
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
                      Price
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="Product Price"
                      className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isViewOnly}
                      required
                    />
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
            Create Product
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
                    Description
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Price
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
                {products.length > 0 ? (
                  products.map((product: any) => (
                    <TableRow key={product?.id}>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.name || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.details || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {product.price || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <button
                          type="button"
                          onClick={() => handleView(product?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg mr-2"
                        >
                          <ListIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(product?.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg mr-2"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product?.id)}
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
                      No products found
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
