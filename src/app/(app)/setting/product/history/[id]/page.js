"use client";
import Header from "@/app/(app)/Header";
import { useAuth } from "@/libs/auth";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ProductHistory = ({ params }) => {
    const { id } = use(params);
    const [transaction, setTransaction] = useState([]);
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth({ middleware: "auth" });
    const warehouseId = user?.role?.warehouse_id;
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const fetchTrxByProductId = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-trx-by-product-id/${id}/${startDate}/${endDate}`, {
                params: {
                    warehouse_id: warehouseId,
                },
            });
            setTransaction(response.data.data.transactions);
            setProduct(response.data.data.product);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    }, [id, warehouseId, startDate, endDate]);

    useEffect(() => {
        fetchTrxByProductId();
    }, [fetchTrxByProductId]);

    const warehouseInitStock = product?.warehouse_stock?.find((item) => item.warehouse_id === warehouseId)?.init_stock || 0;

    const calculateTotalStock = () => {
        return transaction?.data?.reduce((total, item) => {
            return total + item.quantity;
        }, warehouseInitStock);
    };

    console.log(product);
    return (
        <>
            <Header title="Product History" />
            <div className="py-8 relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">
                        <Link href="/setting/product">
                            <ArrowBigLeft className="w-4 h-4 inline mr-2" />
                        </Link>{" "}
                        {product?.name}
                    </h1>
                    <div className="bg-white rounded-3xl">
                        <div className="p-4">
                            <h1>
                                Stok Awal: <span className="font-bold text-blue-500">{formatNumber(warehouseInitStock)}</span>, Rp:{" "}
                                <span className="font-bold text-blue-500">{formatNumber(warehouseInitStock * product?.cost)}</span>
                            </h1>
                            <h1>
                                Stok Saat ini: <span className="font-bold text-blue-500">{formatNumber(calculateTotalStock())}</span>, Rp:{" "}
                                <span className="font-bold text-blue-500">{formatNumber(calculateTotalStock() * product?.cost)}</span>
                            </h1>
                        </div>
                        <table className="table w-full text-sm">
                            <thead>
                                <tr>
                                    <th>Transaction Type</th>
                                    <th>Transaction Date</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction?.data?.map((transaction) => (
                                    <tr
                                        key={transaction?.id}
                                        className={`hover:bg-orange-100 ${transaction?.transaction_type === "Purchase" ? "text-green-700" : "text-red-500"}`}
                                    >
                                        <td>{transaction?.transaction_type === "Purchase" ? "Pembelian" : "Penjualan"}</td>
                                        <td>{formatDateTime(transaction?.date_issued)}</td>
                                        <td>{formatNumber(transaction?.quantity)}</td>
                                        <td>{formatNumber(transaction?.transaction_type === "Purchase" ? transaction?.cost : transaction?.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductHistory;
