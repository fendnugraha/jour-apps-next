"use client";
import Header from "../Header";
import { useCallback, useEffect, useState } from "react";
import {
    ArrowBigDown,
    ArrowBigUp,
    Download,
    DownloadIcon,
    FilterIcon,
    MessageCircleWarningIcon,
    PencilIcon,
    PlusCircleIcon,
    SearchIcon,
    XCircleIcon,
} from "lucide-react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import Link from "next/link";
import Paginator from "@/components/Paginator";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { useAuth } from "@/libs/auth";
import WarehouseStock from "./components/WarehouseStock";
import Notification from "@/components/notification";
import ProductTable from "./components/ProductTable";
import EditTransaction from "./components/EditTransaction";
import exportToExcel from "@/libs/exportToExcel";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const InventoryPage = () => {
    const { user } = useAuth({ middleware: "auth" });

    const warehouse = user?.role?.warehouse_id;
    const warehouseName = user?.role?.warehouse?.name;
    const userRole = user.role?.role;
    const [transactions, setTransactions] = useState([]);
    const [trxByDate, setTrxByDate] = useState([]);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [loading, setLoading] = useState(false);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [warehouses, setWarehouses] = useState([]);
    const [isModalUpdateTrxOpen, setIsModalUpdateTrxOpen] = useState(false);
    const [isModalDeleteTrxOpen, setIsModalDeleteTrxOpen] = useState(false);
    const [selectedTrxId, setSelectedTrxId] = useState(null);
    const [search, setSearch] = useState("");
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
        setIsModalUpdateTrxOpen(false);
        setIsModalDeleteTrxOpen(false);
    };

    const fetchTransaction = useCallback(
        async (url = `/api/get-trx-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setTransactions(response.data.data);
            } catch (error) {
                setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            } finally {
                setLoading(false);
            }
        },
        [selectedWarehouse, startDate, endDate, search]
    );

    useEffect(() => {
        fetchTransaction();
    }, [fetchTransaction]);
    const handleChangePage = (url) => {
        fetchTransaction(url);
    };

    const fetchWarehouses = async (url = "/api/get-all-warehouses") => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setWarehouses(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleDeleteTrx = async () => {
        try {
            const response = await axios.delete(`/api/transactions/${selectedTrxId}`);
            setNotification({ type: "success", message: response.data.message });
            fetchTransaction();
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        }
    };

    const filteredByTrxId = transactions.data?.find((trx) => trx.id === selectedTrxId);

    const fetchTrxByDate = useCallback(
        async (url = `/api/get-trx-by-date/${startDate}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setTrxByDate(response.data.data);
            } catch (error) {
                setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            } finally {
                setLoading(false);
            }
        },
        [startDate, endDate]
    );

    useEffect(() => {
        fetchTrxByDate();
    }, [fetchTrxByDate]);
    console.log(trxByDate);
    const exportTransactionToExcel = async () => {
        const headers = [
            { key: "transaction_type", label: "Transaksi" },
            { key: "date", label: "Tanggal" },
            { key: "invoice", label: "Invoice" },
            { key: "product_name", label: "Produk" },
            { key: "category", label: "Kategori" },
            { key: "quantity", label: "Qty" },
            { key: "price", label: "Jual" },
            { key: "cost", label: "Modal" },
            { key: "total_price", label: "Total Jual" },
            { key: "total_cost", label: "Total Modal" },
        ];

        const data = [
            ...trxByDate.map((item) => ({
                transaction_type: item.transaction_type,
                date: formatDateTime(item.date_issued),
                invoice: item.invoice,
                product_name: item.product?.name,
                category: item.product?.category,
                quantity: formatNumber(item.quantity),
                price: formatNumber(item.price),
                cost: formatNumber(item.cost),
                total_price: formatNumber(item.price * item.quantity),
                total_cost: formatNumber(item.quantity * (item.product?.category === "Deposit" ? 1 : item.cost)),
            })),
        ];

        exportToExcel(
            data,
            headers,
            `Laporan Transaksi Gudang ${warehouseName} ${startDate} s/d ${endDate}.xlsx`,
            `Laporan Transaksi Gudang ${warehouseName} ${startDate} s/d ${endDate}`
        );
    };

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Inventory Management"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="overflow-hidden grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white shadow-sm sm:rounded-2xl cols-span-1 sm:col-span-3">
                                <div className="p-4 flex justify-between sm:flex-row flex-col">
                                    <h1 className="text-2xl font-bold mb-4">
                                        Transaksi Barang
                                        <span className="text-xs block text-slate-500 font-normal">
                                            Cabang: {warehouses.find((w) => w.id === Number(selectedWarehouse))?.name}, Periode: {startDate} - {endDate}
                                        </span>
                                    </h1>
                                    <div className="flex items-center gap-1">
                                        <Link href="/inventory/sales" className="btn-primary text-sm font-normal">
                                            <PlusCircleIcon className="w-4 h-4 inline" /> Penjualan
                                        </Link>
                                        {userRole === "Administrator" && (
                                            <Link href="/inventory/purchase" className="btn-primary text-sm font-normal">
                                                <PlusCircleIcon className="w-4 h-4 inline" /> Pembelian
                                            </Link>
                                        )}

                                        {/* <button className="btn-primary text-xs disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={true}>
                                            <PlusCircleIcon className="w-4 h-4 inline" /> Pembelian
                                        </button> */}
                                        <button
                                            onClick={() => exportTransactionToExcel()}
                                            className="bg-white p-2 rounded-lg border border-slate-300 hover:border-slate-400"
                                        >
                                            <DownloadIcon size={20} />
                                        </button>
                                        <button
                                            onClick={() => setIsModalFilterJournalOpen(true)}
                                            className="bg-white p-2 rounded-lg border border-slate-300 hover:border-slate-400"
                                        >
                                            <FilterIcon size={20} />
                                        </button>
                                        <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                            {userRole === "Administrator" && (
                                                <div className="mb-4">
                                                    <Label>Cabang</Label>
                                                    <select
                                                        onChange={(e) => {
                                                            setSelectedWarehouse(e.target.value);
                                                        }}
                                                        value={selectedWarehouse}
                                                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    >
                                                        <option value="all">Semua Akun</option>
                                                        {warehouses.map((w) => (
                                                            <option key={w.id} value={w.id}>
                                                                {w.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div>
                                                    <Label>Tanggal</Label>
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>s/d</Label>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                        disabled={!startDate}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    fetchTransaction();
                                                    setIsModalFilterJournalOpen(false);
                                                }}
                                                className="btn-primary"
                                            >
                                                Submit
                                            </button>
                                        </Modal>
                                    </div>
                                </div>
                                <div className="px-4 mb-2 flex">
                                    <input
                                        type="search"
                                        value={search || ""}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari barang..."
                                        className="w-full text-sm rounded-l-lg rounded-r-none border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    />
                                    <button
                                        onClick={() => {
                                            fetchTransaction();
                                        }}
                                        className="bg-slate-500 text-sm text-white min-w-20 sm:min-w-32 p-2 rounded-r-lg border border-gray-500 hover:border-gray-400 w-fit"
                                    >
                                        <SearchIcon size={24} className="inline" /> <span className="hidden sm:inline">Search</span>
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="table w-full text-xs">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Jual</th>
                                                <th>Modal</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center">
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : transactions.data?.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center">
                                                        Tidak ada transaksi
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.data?.map((transaction) => (
                                                    <tr key={transaction.id}>
                                                        <td className="text-center">
                                                            {transaction.transaction_type === "Purchase" ? (
                                                                <ArrowBigDown size={24} className="text-green-500 inline" />
                                                            ) : (
                                                                <ArrowBigUp size={24} className="text-red-500 inline" />
                                                            )}{" "}
                                                            <span className="">{transaction.transaction_type}</span>
                                                        </td>
                                                        <td className="font-bold">
                                                            <span className="text-xs font-normal block text-slate-500">
                                                                {formatDateTime(transaction.date_issued)} {transaction.invoice}
                                                            </span>

                                                            {transaction.product.name}
                                                        </td>
                                                        <td className="text-center">
                                                            {formatNumber(transaction.quantity < 0 ? transaction.quantity * -1 : transaction.quantity)}
                                                        </td>
                                                        <td className="text-end">{formatNumber(transaction.price)}</td>
                                                        <td className="text-end">{formatNumber(transaction.cost)}</td>
                                                        <td className="text-center">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTrxId(transaction.id);
                                                                    setIsModalUpdateTrxOpen(true);
                                                                }}
                                                                disabled={["Initial Stock", "Stock Adjustment"].includes(transaction.transaction_type)}
                                                            >
                                                                <PencilIcon className="w-4 h-4 text-green-500 mr-2 inline hover:scale-125 transition-transform duration-300" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTrxId(transaction.id);
                                                                    setIsModalDeleteTrxOpen(true);
                                                                }}
                                                                disabled={true}
                                                            >
                                                                <XCircleIcon className="w-4 h-4 text-red-500 inline hover:scale-125 transition-transform duration-300" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4">
                                    {transactions.last_page > 1 && <Paginator links={transactions} handleChangePage={handleChangePage} />}
                                </div>
                            </div>
                            <div className="bg-white shadow-sm sm:rounded-2xl">
                                <WarehouseStock
                                    warehouse={warehouse}
                                    warehouseName={warehouseName}
                                    notification={(type, message) => setNotification({ type, message })}
                                />
                            </div>
                            <Modal isOpen={isModalUpdateTrxOpen} onClose={closeModal} modalTitle="Update Transaksi" maxWidth="max-w-md">
                                <EditTransaction
                                    isModalOpen={setIsModalUpdateTrxOpen}
                                    transaction={filteredByTrxId}
                                    warehouse={warehouse}
                                    warehouseName={warehouseName}
                                    notification={(type, message) => setNotification({ type, message })}
                                    fetchTransaction={fetchTransaction}
                                />
                            </Modal>
                            <Modal isOpen={isModalDeleteTrxOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                                    <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedTrxId})?</p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => {
                                            handleDeleteTrx(selectedTrxId);
                                            setIsModalDeleteTrxOpen(false);
                                        }}
                                        className="btn-primary w-full"
                                    >
                                        Ya
                                    </button>
                                    <button
                                        onClick={() => setIsModalDeleteTrxOpen(false)}
                                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Tidak
                                    </button>
                                </div>
                            </Modal>
                        </div>
                        <ProductTable
                            warehouse={warehouse}
                            warehouseName={warehouseName}
                            notification={(type, message) => setNotification({ type, message })}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default InventoryPage;
