"use client";
import Header from "@/app/(app)/Header";
import MainPage from "@/app/(app)/main";
import Paginator from "@/components/Paginator";
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

    const fetchTrxByProductId = useCallback(
        async (url = `/api/get-trx-by-product-id/${id}/${startDate}/${endDate}`) => {
            try {
                const response = await axios.get(url, {
                    params: {
                        warehouse_id: warehouseId,
                    },
                });
                setTransaction(response.data.data.transactions);
                setProduct(response.data.data.product);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        },
        [id, warehouseId, startDate, endDate]
    );

    useEffect(() => {
        fetchTrxByProductId();
    }, [fetchTrxByProductId]);

    const handleChangePage = (url) => {
        fetchTrxByProductId(url);
    };

    const warehouseInitStock = product?.warehouse_stock?.find((item) => item.warehouse_id === warehouseId)?.init_stock || 0;

    const calculateTotalStock = () => {
        return transaction?.data?.reduce((total, item) => {
            return total + -item.quantity;
        }, warehouseInitStock);
    };
    return (
        <MainPage headerTitle="Product History">
            <h1 className="text-2xl font-bold mb-4">
                <Link href="/setting/product">
                    <ArrowBigLeft className="w-4 h-4 inline mr-2" />
                </Link>{" "}
                {product?.name}
            </h1>
            <div className="bg-white rounded-3xl">
                <div className="p-4 flex justify-end">
                    <div>
                        <span className="text-sm block text-slate-300">Total Stock</span>
                        <h1 className="text-2xl font-bold ml-2">{calculateTotalStock()}</h1>
                    </div>
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
                            <tr key={transaction?.id} className={`hover:bg-orange-100`}>
                                <td>{transaction?.transaction_type === "Purchase" ? "Pembelian" : "Penjualan"}</td>
                                <td className="text-center">{formatDateTime(transaction?.date_issued)}</td>
                                <td className={`text-right  ${transaction?.transaction_type === "Purchase" ? "text-green-700" : "text-red-500"}`}>
                                    {formatNumber(transaction?.quantity)}
                                </td>
                                <td className="text-right">
                                    {formatNumber(transaction?.transaction_type === "Purchase" ? transaction?.cost : transaction?.price)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-4">{transaction?.last_page > 1 && <Paginator links={transaction} handleChangePage={handleChangePage} />}</div>
            </div>
        </MainPage>
    );
};

export default ProductHistory;
