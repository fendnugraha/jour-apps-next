"use client";

import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { useEffect, useState } from "react";

const FinanceYearlyTable = ({ financeType }) => {
    const [finance, setFinance] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const fetchFinanceYearly = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-finance-yearly/${year}`);
            setFinance(response.data.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceYearly();
    }, [year]);
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const filteredFinanceByType = finance?.finance?.filter((item) => item.finance_type === financeType);
    console.log(financeType);
    const initBalance = finance?.initBalance?.[financeType];
    let runningBalance = Number(initBalance);

    return (
        <div className="bg-white p-4 rounded-3xl ">
            <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold mb-4">
                    {financeType === "Payable" ? "Hutang" : "Piutang"} {year}
                </h1>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Bill</th>
                            <th>Payment</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="font-semibold text-blue-600">
                            <td>Saldo Awal</td>
                            <td></td>
                            <td></td>
                            <td className="text-right">{loading ? "loading.." : formatNumber(initBalance)}</td>
                        </tr>

                        {filteredFinanceByType?.map((item, index) => {
                            runningBalance += Number(item.sisa || 0);
                            return (
                                <tr key={index}>
                                    <td>{monthNames[item.month]}</td>
                                    <td className="text-right">{formatNumber(item.tagihan)}</td>
                                    <td className="text-right">{formatNumber(item.terbayar)}</td>
                                    <td className="text-right">{formatNumber(runningBalance)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceYearlyTable;
