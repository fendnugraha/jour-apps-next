"use client";
import { use, useCallback, useEffect, useState } from "react";
import Header from "../../Header";
import ProductCard from "../components/ProductCard";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { LoaderCircleIcon, MinusCircleIcon, Trash2Icon, TrashIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Notification from "@/components/notification";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Clean up on component unmount or when value changes
        };
    }, [value, delay]);

    return debouncedValue;
};

const Purchase = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);

    const [productList, setProductList] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500); // Apply debounce with 500ms delay
    const [cartPo, setCartPo] = useState([]);
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const [formData, setFormData] = useState({
        dateIssued: today,
        paymentAccountID: "",
        feeCustomer: 0,
        transaction_type: "Purchase",
    });
    const [isModalCheckOutOpen, setIsModalCheckOutOpen] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const closeModal = () => {
        setIsModalCheckOutOpen(false);
    };

    const fetchAccountByIds = useCallback(async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2, 23] });
    }, [fetchAccountByIds]);

    const fetchProduct = useCallback(async () => {
        if (debouncedSearch.length > 3) {
            try {
                const response = await axios.get("/api/products", {
                    params: { search: debouncedSearch },
                });
                setProductList(response.data.data);
            } catch (error) {
                console.log("Error fetching products:", error);
            }
        } else {
            setProductList([]); // Clear product list if search is too short
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchProduct();
    }, [debouncedSearch, fetchProduct]);

    const addToCart = (product) => {
        setCartPo((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                // If product is already in the cart, increase its quantity
                return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            // Otherwise, add the product to the cart with quantity 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    useEffect(() => {
        localStorage.setItem("cartPo", JSON.stringify(cartPo));
    }, [cartPo]);

    const removeFromCart = (product) => {
        setCartPo((prevCart) => {
            return prevCart.filter((item) => item.id !== product.id);
        });
    };

    const updateQuantity = (product, newQuantity) => {
        setCartPo((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item));
        });
    };

    const total = cartPo.reduce((total, item) => total + item.price * item.quantity, 0);

    const updatePrice = (product, newPrice) => {
        setCartPo((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, price: newPrice } : item));
        });
    };

    const updateCost = (product, newCost) => {
        setCartPo((prevCart) => {
            return prevCart.map((item) => (item.id === product.id ? { ...item, cost: newCost } : item));
        });
    };

    const clearCart = () => {
        setCartPo([]);
    };

    useEffect(() => {
        const cartData = localStorage.getItem("cartPo");
        if (cartData) {
            setCartPo(JSON.parse(cartData));
        }
    }, []);

    const handleCheckout = async () => {
        const payload = {
            ...formData,
            cart: cartPo,
        };
        setLoading(true);
        try {
            const response = await axios.post("/api/store-with-deposit", payload);
            setNotification({ type: "success", message: response.data.message });
            setFormData({
                dateIssued: today,
                paymentAccountID: 8,
                feeCustomer: 0,
                transaction_type: "Sales",
            });
            clearCart();
            setIsModalCheckOutOpen(false);
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <Header title={"Store - Purchase"} />
            <div className="py-8 relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="h-[calc(100vh-72px-63px)] flex gap-4">
                        <div className="overflow-hidden w-96">
                            <input
                                type={`search`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                                placeholder="Cari barang..."
                            />
                            <div className="flex flex-col gap-1 overflow-auto h-full">
                                {productList?.data?.length === 0 ? (
                                    <div className="text-center">Barang tidak ditemukan</div>
                                ) : (
                                    productList?.data?.map((product) => (
                                        <ProductCard product={product} key={product.id} onAddToCart={() => addToCart(product)} />
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex-1 flex flex-col justify-between">
                            <div className="">
                                <div className="p-2 border-b border-gray-200">
                                    {" "}
                                    <h1 className="font-bold">Items ({cartPo.length})</h1>
                                </div>
                                <div className="py-2 px-4 sm:px-6 overflow-y-auto">
                                    <div className="flex flex-col gap-2 h-[calc(58px*7)]">
                                        {cartPo.map((product) => (
                                            <div className="flex flex-col gap-1 border-b border-gray-200 border-dashed pb-2" key={product.id}>
                                                <div className="flex justify-between items-center">
                                                    <h1 className="text-sm font-bold">{product.name}</h1>
                                                    <button onClick={() => removeFromCart(product)}>
                                                        <MinusCircleIcon size={18} className="text-red-500" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <small className="text-xs text-gray-500">
                                                        Qty:{" "}
                                                        <input
                                                            type="number"
                                                            className="w-32 px-2 py-1 rounded-sm mr-4 border border-slate-300"
                                                            value={product.quantity}
                                                            onChange={(e) => updateQuantity(product, e.target.value)}
                                                            min={1}
                                                        />
                                                    </small>
                                                    <small className="text-xs text-gray-500">
                                                        Harga:{" "}
                                                        <input
                                                            type="number"
                                                            className="w-32 px-2 py-1 rounded-sm mr-4 border border-slate-300"
                                                            value={product.price}
                                                            onChange={(e) => updatePrice(product, e.target.value)}
                                                        />
                                                    </small>

                                                    <small className="text-xs text-gray-500 font-bold">
                                                        Total: {formatNumber(product.price * product.quantity)}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center bg-blue-500 px-4">
                                <h1 className="text-white font-semibold">Total: {formatNumber(total)}</h1>
                                <div className="flex justify-end w-1/2">
                                    <button
                                        className="flex-grow bg-green-400 hover:bg-green-300 cursor-pointer hover:text-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-white"
                                        onClick={() => setIsModalCheckOutOpen(true)}
                                        disabled={cartPo.length === 0}
                                    >
                                        Checkout
                                    </button>
                                    <button
                                        className="bg-red-400 text-white font-semibold py-2 px-4 rounded-lg ml-2 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-white"
                                        onClick={clearCart}
                                        disabled={cartPo.length === 0}
                                    >
                                        <Trash2Icon size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal isOpen={isModalCheckOutOpen} onClose={closeModal} modalTitle="Checkout Order" maxWidth={"max-w-lg"}>
                    <div className="flex justify-center items-center border-b border-gray-300 border-dashed pb-2 mb-4">
                        <h1 className="text-3xl">Rp {formatNumber(total)}</h1>
                    </div>
                    <div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Tanggal</label>
                            <input
                                type="datetime-local"
                                className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                                value={formData.dateIssued}
                                onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Account Pembayaran</label>
                            <select
                                className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                                value={formData.paymentAccountID}
                                onChange={(e) => setFormData({ ...formData, paymentAccountID: e.target.value })}
                            >
                                <option value="">Pilih Account Pembayaran</option>
                                {accounts?.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.acc_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 disabled:bg-slate-300 disabled:cursor-wait rounded-xl"
                        disabled={loading}
                    >
                        {loading ? <LoaderCircleIcon className="animate-spin" /> : "Simpan"}
                    </button>
                </Modal>
            </div>
        </>
    );
};

export default Purchase;
