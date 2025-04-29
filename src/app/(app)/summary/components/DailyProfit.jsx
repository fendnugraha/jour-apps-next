"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Link from "next/link";
import exportToExcel from "@/libs/exportToExcel";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const thisMonth = getCurrentDate().split("-")[1];
const thisYear = getCurrentDate().split("-")[0];

const DailyProfit = () => {
    const [dailyProfit, setDailyProfit] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchDailyReport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-daily-profit/${month}/${year}`);
            setDailyProfit(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyReport();
    }, []);

    const sumByTrxType = (trxType) => {
        return revenue.revenue?.reduce((total, item) => {
            return total + Number(item[trxType]);
        }, 0);
        // console.log(revenue.revenue?.[0][trxType]);
    };

    //export to excel
    const headersRevenue = [
        { key: "warehouse", label: "Cabang" },
        { key: "transfer", label: "Transfer" },
        { key: "tarikTunai", label: "Tarik Tunai" },
        { key: "voucher", label: "Voucher" },
        { key: "accessories", label: "Accessories" },
        { key: "deposit", label: "Deposit" },
        { key: "trx", label: "Transaksi" },
        { key: "expense", label: "Pengeluaran" },
        { key: "fee", label: "Profit" },
    ];

    console.log(dailyProfit);

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4 flex justify-between">
                <h4 className=" text-blue-950 text-lg font-bold">
                    Laporan Laba Harian (Daily Profit)
                    <span className="text-xs block text-slate-500 font-normal">
                        Periode: {startDate} - {endDate}
                    </span>
                </h4>
                <div className="flex gap-1">
                    <button
                        onClick={() => fetchDailyReport()}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button
                        onClick={() =>
                            exportToExcel(
                                revenue?.revenue,
                                headersRevenue,
                                `Summary Report by Warehouse ${startDate} s/d ${endDate}.xlsx`,
                                `Summary Report by Warehouse ${startDate} s/d ${endDate}`
                            )
                        }
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                        // disabled={revenue?.revenue?.length === 0}
                    >
                        <DownloadIcon className="size-4" />
                    </button>
                    <button
                        onClick={() => setIsModalFilterDataOpen(true)}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                    >
                        <FilterIcon className="size-4" />
                    </button>
                    <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                        <div className="mb-4">
                            <Label className="font-bold">Tanggal</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div className="mb-4">
                            <Label className="font-bold">s/d</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <button onClick={fetchDailyReport} className="btn-primary">
                            Submit
                        </button>
                    </Modal>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs mb-2">
                    <thead className="">
                        <tr>
                            <th className="">Tanggal</th>
                            <th className="">Pendapatan</th>
                            <th className="">Hpp</th>
                            <th className="">Biaya</th>
                            <th className="">Net Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyProfit.map((item, index) => (
                            <tr key={index}>
                                <td className="">{item.day}</td>
                                <td className="">{formatNumber(item.revenue)}</td>
                                <td className="">{formatNumber(item.cost)}</td>
                                <td className="">{formatNumber(item.expense)}</td>
                                <td className="">{formatNumber(item.revenue - item.cost - item.expense)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyProfit;
