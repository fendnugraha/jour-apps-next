"use client";
import Header from "@/app/(app)/Header";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { formatNumberToK } from "@/libs/formatNumberToK";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { DownloadIcon, FilterIcon } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import exportToExcel from "@/libs/exportToExcel";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    return `${month}`;
};

const getCurrentYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    return `${year}`;
};

const WarehouseReport = ({ params }) => {
    const { id } = use(params);
    const { warehouses, warehousesError, isValidating } = useGetWarehouses();
    const [revenue, setRevenue] = useState([]);
    const [errors, setErrors] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState(id);
    const [month, setMonth] = useState(getCurrentMonth());
    const [year, setYear] = useState(getCurrentYear());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchRevenueReportByWarehouse = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-revenue-report-by-warehouse/${selectedWarehouse}/${month}/${year}`);
            setRevenue(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, [selectedWarehouse, month, year]);

    useEffect(() => {
        fetchRevenueReportByWarehouse();
    }, [fetchRevenueReportByWarehouse]);

    const filterWarehouse = warehouses?.data?.find((warehouse) => warehouse.id === Number(selectedWarehouse));

    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString("default", { month: "long" });
    };

    const calculatePercentage = (amount, total) => {
        const percentage = ((amount / total) * 100).toFixed(2);
        return percentage;
    };

    const sumTransferAndWithdrawal = Number(revenue?.totals?.totalTransfer) + Number(revenue?.totals?.totalTarikTunai);
    const calculateTransferPercentage = calculatePercentage(Number(revenue?.totals?.totalTransfer), sumTransferAndWithdrawal);

    const calculateWithdrawalPercentage = calculatePercentage(Number(revenue?.totals?.totalTarikTunai), sumTransferAndWithdrawal);

    const calculateAverageDailyProfit = (Number(revenue?.totals?.totalFee) / Number(revenue?.revenue?.length)).toFixed(2);

    //export to excel
    const headersRevenue = [
        { key: "date", label: "Tanggal" },
        { key: "transfer", label: "Transfer" },
        { key: "tarikTunai", label: "Tarik Tunai" },
        { key: "voucher", label: "Voucher" },
        { key: "deposit", label: "Deposit" },
        { key: "trx", label: "Transaksi" },
        { key: "expense", label: "Pengeluaran" },
        { key: "fee", label: "Profit" },
    ];
    return (
        <>
            <Header title={"Summary Report by Warehouse"} />
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4 gap-2">
                                <select
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    value={selectedWarehouse}
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 rounded-md border w-full"
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses?.data?.map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setIsModalFilterDataOpen(true)}
                                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                                >
                                    <FilterIcon className="size-4" />
                                </button>
                                <button
                                    onClick={() =>
                                        exportToExcel(
                                            revenue?.revenue,
                                            headersRevenue,
                                            `Summary Report by Warehouse ${filterWarehouse?.name} ${getMonthName(month)} ${year}.xlsx`,
                                            `Summary Report by Warehouse ${filterWarehouse?.name} ${getMonthName(month)} ${year}`
                                        )
                                    }
                                    className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    disabled={revenue?.revenue?.length === 0}
                                >
                                    <DownloadIcon className="size-4" />
                                </button>
                                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                    <div className="mb-4">
                                        <Label htmlFor="month">Bulan</Label>
                                        <select
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 rounded-md border w-full"
                                            onChange={(e) => setMonth(e.target.value)}
                                            value={month}
                                        >
                                            <option value="">Pilih Bulan</option>
                                            <option value="01">Januari</option>
                                            <option value="02">Februari</option>
                                            <option value="03">Maret</option>
                                            <option value="04">April</option>
                                            <option value="05">Mei</option>
                                            <option value="06">Juni</option>
                                            <option value="07">Juli</option>
                                            <option value="08">Agustus</option>
                                            <option value="09">September</option>
                                            <option value="10">Oktober</option>
                                            <option value="11">November</option>
                                            <option value="12">Desember</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <Label htmlFor="year">Tahun</Label>
                                        <select
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-2 rounded-md border w-full"
                                            onChange={(e) => setYear(e.target.value)}
                                            value={year}
                                        >
                                            <option value="">Pilih Tahun</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                        </select>
                                    </div>
                                    <button onClick={() => setIsModalFilterDataOpen(false)} className="btn-primary">
                                        Submit
                                    </button>
                                </Modal>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Warehouse Report ({filterWarehouse?.name || "Loading..."})</h1>
                                <span className="text-gray-600 text-xs">
                                    Periode: {getMonthName(month)} {year}
                                </span>
                                <div className="flex justify-end items-center gap-5">
                                    <div>
                                        <span className="text-gray-600 text-xs">Transfer</span>
                                        <h1 className="text-2xl font-bold">
                                            {formatNumberToK(revenue?.totals?.totalTransfer || 0)}{" "}
                                            <span className="text-gray-500 text-xs">{calculateTransferPercentage} %</span>
                                        </h1>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-xs">Tarik Tunai</span>
                                        <h1 className="text-2xl font-bold">
                                            {formatNumberToK(revenue?.totals?.totalTarikTunai || 0)}{" "}
                                            <span className="text-gray-500 text-xs">{calculateWithdrawalPercentage} %</span>
                                        </h1>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-xs">Transaksi</span>
                                        <h1 className="text-2xl font-bold">{formatNumber(revenue?.totals?.totalTrx || 0)}</h1>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-xs">Profit Rata2</span>
                                        <h1 className="text-2xl font-bold">{formatNumberToK(calculateAverageDailyProfit || 0)}</h1>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 text-xs">Net Profit</span>
                                        <h1 className="text-2xl font-bold">{formatNumber(revenue?.totals?.totalFee || 0)}</h1>
                                    </div>
                                </div>
                                <div className="overflow-x-auto relative">
                                    {loading && (
                                        <div className="flex justify-center items-center font-medium bg-white/50 h-full w-full backdrop-blur-sm absolute z-10">
                                            Loading data, please wait ...
                                        </div>
                                    )}
                                    <table className="table w-full text-xs mb-2">
                                        <thead className="">
                                            <tr>
                                                <th className="">Tanggal</th>
                                                <th className="">Transfer</th>
                                                <th className="">Tarik Tunai</th>
                                                <th className="">Voucher</th>
                                                <th className="">Deposit</th>
                                                <th className="">Trx</th>
                                                <th className="">Biaya</th>
                                                <th className="">Laba Bersih</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenue?.revenue?.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="text-center">{item.date}</td>
                                                    <td className="text-end">{formatNumber(item.transfer)}</td>
                                                    <td className="text-end">{formatNumber(item.tarikTunai)}</td>
                                                    <td className="text-end">{formatNumber(item.voucher)}</td>
                                                    <td className="text-end">{formatNumber(item.deposit)}</td>
                                                    <td className="text-end">{formatNumber(item.trx)}</td>
                                                    <td className="text-end font-bold text-red-500">{formatNumber(item.expense)}</td>
                                                    <td className="text-end font-bold text-green-500">{formatNumber(item.fee)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td className="text-center font-bold">Total</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalTransfer)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalTarikTunai)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalVoucher)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalDeposit)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalTrx)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalExpense)}</td>
                                                <td className="text-end font-bold">{formatNumber(revenue?.totals?.totalFee)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehouseReport;
