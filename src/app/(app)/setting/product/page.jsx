"use client";

import Header from "@/app/(app)/Header";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { useState, useEffect, use } from "react";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import CreateCategoryProduct from "./CreateCategoryProduct";
import CreateProduct from "./CreateProduct";
import formatNumber from "@/libs/formatNumber";
import { EyeIcon, MessageCircleWarningIcon, PencilIcon, PlusCircleIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import EditProduct from "./EditProduct";
import AddInitStockToWarehouse from "./AddInitStockToWarehouse";
import Notification from "@/components/notification";
import Link from "next/link";
import Button from "@/components/Button";
import MainPage from "../../main";

export default function Product() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState([]); // Store validation errors
    const [isModalCreateProductOpen, setIsModalCreateProductOpen] = useState(false);
    const [isModalCreateCategoryProductOpen, setIsModalCreateCategoryProductOpen] = useState(false);
    const [isModalUpdateProductOpen, setIsModalUpdateProductOpen] = useState(false);
    const [isModalDeleteProductOpen, setIsModalDeleteProductOpen] = useState(false);
    const [isModalAddInitStockOpen, setIsModalAddInitStockOpen] = useState(false);
    const [productCategories, setProductCategories] = useState([]);

    // Fetch Accounts
    const fetchProducts = async (url = "/api/products") => {
        setLoading(true);
        try {
            const response = await axios.get(url, {
                params: {
                    search: search,
                },
            });
            setProduct(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductCategories = async () => {
        try {
            const response = await axios.get("api/product-categories");
            setProductCategories(response.data.data);
        } catch (error) {
            setErrors(error.response?.message || ["Something went wrong."]);
        }
    };

    useEffect(() => {
        fetchProductCategories();
    }, [product]);

    // const handleSelectProduct = id => {
    //     setSelectedProduct(prevSelected => {
    //         if (prevSelected.includes(id)) {
    //             return prevSelected.filter(item => item !== id)
    //         } else {
    //             return [...prevSelected, id]
    //         }
    //     })
    // }

    const handleDeleteProduct = async (id) => {
        try {
            const response = await axios.delete(`api/products/${id}`);
            setNotification(response.data.message);
            fetchProducts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setNotification(error.response.data.message);
        }
    };

    const closeModal = () => {
        setIsModalCreateProductOpen(false);
        setIsModalCreateCategoryProductOpen(false);
        setIsModalUpdateProductOpen(false);
        setIsModalDeleteProductOpen(false);
        setIsModalAddInitStockOpen(false);
        // setIsModalUpdateAccountOpen(false)
    };

    const handleSelectProduct = (id) => {
        setSelectedProduct((prevSelected) => {
            // Check if the ID is already in the selectedProduct array
            if (prevSelected.includes(id)) {
                // If it exists, remove it
                return prevSelected.filter((productId) => productId !== id);
            } else {
                // If it doesn't exist, add it
                return [...prevSelected, id];
            }
        });
    };

    useEffect(() => {
        fetchProducts("/api/products");
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts("/api/products");
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    // useEffect(() => {
    //     // console.log(selectedUpdateAccount)

    //     handleShowAccount()
    // }, [])
    const handleChangePage = (url) => {
        fetchProducts(url);
    };

    const selectedProductById = product?.data?.find((item) => item.id === selectedProductId);
    return (
        <MainPage headerTitle="Product">
            <div className="overflow-hidden">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="">
                    {errors.length > 0 && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="flex justify-between">
                        {/* {selectedAccount.length > 0 && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleDeleteSelectedAccounts}>
                                        Hapus terpilih {selectedAccount.length}
                                    </button>
                                )} */}
                        <div className="flex justify-end gap-2 mb-4">
                            <button className="btn-primary text-sm" onClick={() => setIsModalCreateProductOpen(true)}>
                                Tambah Produk <PlusCircleIcon className="w-5 h-5 inline" />
                            </button>
                            <button className="btn-primary text-sm" onClick={() => setIsModalCreateCategoryProductOpen(true)}>
                                Tambah Kategori <PlusCircleIcon className="w-5 h-5 inline" />
                            </button>
                        </div>
                        <Modal isOpen={isModalCreateProductOpen} onClose={closeModal} modalTitle="Create account">
                            <CreateProduct
                                isModalOpen={setIsModalCreateProductOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchProducts={fetchProducts}
                                productCategories={productCategories}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateCategoryProductOpen} onClose={closeModal} modalTitle="Create account">
                            <CreateCategoryProduct
                                isModalOpen={setIsModalCreateCategoryProductOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchProducts={fetchProducts}
                            />
                        </Modal>
                    </div>
                    <div className="flex justify-between mb-4">
                        <div className="relative w-full sm:max-w-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="block w-full text-sm pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <Button type="button" className={`cursor-pointer`} onClick={() => fetchProducts("/api/products")}>
                            Refresh
                        </Button>
                    </div>
                    <div className="overflow-x-auto bg-white rounded-2xl w-full sm:w-3/4 drop-shadow-sm">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="text-center">#</th>
                                    <th>Product</th>
                                    <th>Price (Jual)</th>
                                    <th>Cost (Beli)</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">No products found</td>
                                    </tr>
                                ) : (
                                    product?.data?.map((product) => (
                                        <tr key={product.id}>
                                            <td className="text-center">
                                                <Input
                                                    checked={selectedProduct.includes(product.id)}
                                                    onChange={() => {
                                                        handleSelectProduct(product.id);
                                                    }}
                                                    type="checkbox"
                                                />
                                            </td>
                                            <td>
                                                {product.name}
                                                <span className="block text-xs text-slate-400">
                                                    {product.code} {product.category?.name}
                                                </span>
                                            </td>
                                            <td>{formatNumber(product.price)}</td>
                                            <td>{formatNumber(product.current_cost)}</td>
                                            <td className="">
                                                <span className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsModalUpdateProductOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsModalDeleteProductOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <TrashIcon className="size-4" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-4">{product?.last_page > 1 && <Paginator links={product} handleChangePage={handleChangePage} />}</div>
                    </div>
                </div>
                <Modal isOpen={isModalAddInitStockOpen} onClose={closeModal} modalTitle="Add Initial Stock" maxWidth="max-w-md">
                    <AddInitStockToWarehouse
                        isModalOpen={setIsModalAddInitStockOpen}
                        selectedProductById={selectedProductById}
                        notification={(type, message) => setNotification({ type, message })}
                    />
                </Modal>
                <Modal isOpen={isModalUpdateProductOpen} onClose={closeModal} modalTitle="Edit Product" maxWidth="max-w-md">
                    <EditProduct
                        isModalOpen={setIsModalUpdateProductOpen}
                        notification={(type, message) => setNotification({ type, message })}
                        fetchProducts={fetchProducts}
                        selectedProductId={selectedProductId}
                        products={product}
                        productCategories={productCategories}
                        setSelectedProductId={setSelectedProductId}
                    />
                </Modal>
                <Modal isOpen={isModalDeleteProductOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                        <MessageCircleWarningIcon size={72} className="text-red-600" />
                        <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedProductId})?</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => {
                                handleDeleteProduct(selectedProductId);
                                setIsModalDeleteProductOpen(false);
                            }}
                            className="btn-primary w-full"
                        >
                            Ya
                        </button>
                        <button
                            onClick={() => setIsModalDeleteProductOpen(false)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Tidak
                        </button>
                    </div>
                </Modal>
            </div>
        </MainPage>
    );
}
