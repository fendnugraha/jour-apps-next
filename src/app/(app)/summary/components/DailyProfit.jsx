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

    //export to excel
    const headersRevenue = [
        { key: "day", label: "Tanggal" },
        { key: "revenue", label: "Pendapatan" },
        { key: "cost", label: "HPP" },
        { key: "expense", label: "Biaya" },
    ];

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4 flex justify-between">
                <h4 className=" text-blue-950 text-lg font-bold">
                    Laporan Laba Harian (Daily Profit)
                    <span className="text-xs block text-slate-500 font-normal">
                        Periode: {month}/{year}
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
                        onClick={() => exportToExcel(dailyProfit, headersRevenue, `Daily profit ${month}/${year}.xlsx`, `Daily profit ${month}/${year}`)}
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
                            <Label className="font-bold">Bulan</Label>
                            <select
                                onChange={(e) => setMonth(e.target.value)}
                                value={month}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option>-Pilih Bulan-</option>
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
                            <Label className="font-bold">Tahun</Label>
                            <select
                                onChange={(e) => setYear(e.target.value)}
                                value={year}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                                <option>-Pilih Tahun-</option>
                                <option value="2022">2022</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
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
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            dailyProfit.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{formatNumber(item.revenue)}</td>
                                    <td>{formatNumber(item.cost)}</td>
                                    <td>{formatNumber(item.expense)}</td>
                                    <td>{formatNumber(item.revenue - item.cost - item.expense)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="font-semibold text-gray-800 bg-gray-100">
                        <tr>
                            <td>Total</td>
                            <td>{formatNumber(dailyProfit.reduce((sum, item) => sum + item.revenue, 0))}</td>
                            <td>{formatNumber(dailyProfit.reduce((sum, item) => sum + item.cost, 0))}</td>
                            <td>{formatNumber(dailyProfit.reduce((sum, item) => sum + item.expense, 0))}</td>
                            <td>{formatNumber(dailyProfit.reduce((sum, item) => sum + (item.revenue - item.cost - item.expense), 0))}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default DailyProfit;
