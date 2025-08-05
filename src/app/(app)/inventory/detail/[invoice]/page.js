"use client";
import Header from "@/app/(app)/Header";
import Dropdown from "@/components/Dropdown";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { ArrowLeftIcon, Ellipsis, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

const TransactionDetail = ({ params }) => {
    const { invoice } = use(params);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [order, setOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/get-trx-by-invoice/${invoice}`);
            setOrder(response.data.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setIsLoading(false);
        }
    }, [invoice]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const formatLongDate = (date) => {
        // September 7, 2023
        const formattedDate = new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        return formattedDate;
    };
    const calculateTotalTransaction = () => {
        let total = 0;
        order?.stock_movements?.forEach((item) => {
            const totalCost = item.cost * item.quantity;
            const totalPrice = item.product?.is_digital === 1 ? item.price : -item.price * item.quantity;
            total += item.transaction_type === "Purchase" ? Number(totalCost) : Number(totalPrice);
        });
        return total;
    };
    return (
        <>
            <Header title="Transaction Detail" />
            <div className="py-8 relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link className="underline hover:text-teal-500" href="/inventory">
                            <ArrowLeftIcon />
                        </Link>
                        <h1 className="text-slate-500">
                            Invoice: <span className="font-bold">{invoice}</span>{" "}
                        </h1>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-3xl drop-shadow-sm">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="font-bold">Invoice</td>
                                        <td>: {order?.invoice}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Tanggal Transaksi</td>
                                        <td>: {formatLongDate(order?.date_issued)}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Tipe Transaksi</td>
                                        <td>: {order?.transaction_type === "Purchase" ? "Pembelian Barang" : "Penjualan Barang"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Cabang</td>
                                        <td>: {order?.warehouse?.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Status</td>
                                        <td>
                                            : {order?.status} <span className="text-slate-400">({formatDateTime(order?.updated_at)})</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div>
                                <h1 className="text-slate-500 font-bold text-sm">{order?.transaction_type === "Purchase" ? "Supplier" : "Customer"}</h1>
                                <h1 className="text-slate-500 text-sm mb-4">{order?.contact?.name}</h1>
                                <h1 className="text-slate-500 font-bold text-sm">Total Transaksi</h1>
                                <h1 className="text-slate-500 font-bold text-3xl">Rp {formatNumber(calculateTotalTransaction())}</h1>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">Tambah Barang</button>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs table">
                                <thead>
                                    <tr className="text-left">
                                        <th></th>
                                        <th>Nama Barang</th>
                                        <th>Qty</th>
                                        <th>Harga</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.stock_movements?.length > 0 ? (
                                        order?.stock_movements?.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-100">
                                                <td className="text-center w-12">
                                                    {["Purchase", "Sales"].includes(item.transaction_type) && (
                                                        <Dropdown align="left" trigger={<EllipsisIcon className="w-4 h-4" />}>
                                                            <ul>
                                                                <li>
                                                                    <button className="text-start px-2 py-1 min-w-20 hover:underline hover:bg-slate-200">
                                                                        Edit Barang
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button className="text-start px-2 py-1 min-w-20 text-red-500 hover:underline hover:bg-slate-200">
                                                                        Hapus
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="text-slate-400">{item.product?.code}</span> {item.product?.name}
                                                </td>
                                                <td className="text-center">
                                                    {formatNumber(item.transaction_type === "Purchase" ? item.quantity : -item.quantity)}
                                                </td>
                                                <td className="text-right">{formatNumber(item.transaction_type === "Purchase" ? item.cost : item.price)}</td>
                                                <td className="text-right">
                                                    {formatNumber(
                                                        item.transaction_type === "Purchase"
                                                            ? item.cost * item.quantity
                                                            : item.product?.is_digital === 1
                                                            ? item.price
                                                            : -item.price * item.quantity
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center">
                                                Tidak ada transaksi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan="4" className="text-right font-bold">
                                            Total
                                        </th>
                                        <th className="text-right font-bold">{formatNumber(calculateTotalTransaction())}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionDetail;
