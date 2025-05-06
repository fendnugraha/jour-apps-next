"use client";
import React, { useCallback, useEffect, useState } from "react";
import Header from "../../Header";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { FilterIcon, RefreshCcwIcon } from "lucide-react";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const ProfitLoss = () => {
    const [profitLoss, setProfitLoss] = useState([]);
    const [errors, setErrors] = useState([]); // Store validation errors
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchProfitLoss = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/profit-loss-report/${startDate}/${endDate}`);
            setProfitLoss(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchProfitLoss();
    }, [fetchProfitLoss]);

    return (
        <>
            <Header title="Laba Rugi (Profit Loss Statement)" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-5 flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-blue-600">Laba Rugi (Profit Loss Statement)</h1>
                                    <span className="block text-sm text-slate-400">
                                        Periode : {startDate} s/d {endDate}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={fetchProfitLoss}
                                        className="bg-white mr-1 font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCcwIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>
                                    <button
                                        onClick={() => setIsModalFilterDataOpen(true)}
                                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                                    >
                                        <FilterIcon className="size-4" />
                                    </button>
                                </div>
                                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                    <div className="mb-4">
                                        <Label className="font-bold">Dari</Label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <Label className="font-bold">Sampai</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                    <button onClick={() => fetchProfitLoss()} disabled={loading} className="btn-primary">
                                        Submit
                                    </button>
                                </Modal>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <h1 className="text-lg font-bold">Pendapatan (Revenue)</h1>
                                    <span className="block text-slate-500 text-sm mb-2">
                                        Total : {loading ? "Loading.." : formatNumber(profitLoss?.revenue?.total)}
                                    </span>

                                    <table className="table-auto w-full">
                                        <tbody>
                                            {profitLoss?.revenue?.accounts?.map((account, index) => (
                                                <React.Fragment key={index}>
                                                    <tr
                                                        className="text-sm border-b border-slate-300 border-dashed text-slate-600"
                                                        hidden={account.balance === 0}
                                                    >
                                                        <td colSpan={2} className="py-2 font-bold text-start">
                                                            {account.acc_name}
                                                        </td>
                                                        <td className="py-1 font-bold text-end">{formatNumber(account.balance)}</td>
                                                    </tr>
                                                    {account?.coa?.map((coa, index) => (
                                                        <tr key={index} className="text-xs" hidden={coa.balance === 0}>
                                                            <td className="text-start w-5">-</td>
                                                            <td className="py-1 text-start">{coa.acc_name}</td>
                                                            <td className="py-1 text-end">{formatNumber(coa.balance)}</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                    <h1 className="mt-5 text-xl font-bold">HPP (Harga Pokok Penjualan)</h1>
                                    <span className="block text-slate-500 text-sm mb-2">
                                        Total : {loading ? "Loading.." : formatNumber(profitLoss?.cost?.total)}
                                    </span>

                                    <table className="table-auto w-full">
                                        <tbody>
                                            {profitLoss?.cost?.accounts?.map((account, index) => (
                                                <React.Fragment key={index}>
                                                    <tr
                                                        className="text-sm border-b border-slate-300 border-dashed text-slate-600"
                                                        hidden={account.balance === 0}
                                                    >
                                                        <td colSpan={2} className="py-2 font-bold text-start">
                                                            {account.acc_name}
                                                        </td>
                                                        <td className="py-1 font-bold text-end">{formatNumber(account.balance)}</td>
                                                    </tr>
                                                    {account?.coa?.map((coa, index) => (
                                                        <tr key={index} className="text-xs" hidden={coa.balance === 0}>
                                                            <td className="text-start w-5">-</td>
                                                            <td className="py-1 text-start">{coa.acc_name}</td>
                                                            <td className="py-1 text-end">{formatNumber(coa.balance)}</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>

                                    <h1 className="mt-5 text-sm font-bold">Laba (Net Profit)</h1>
                                    <span className="block text-slate-500 text-5xl font-bold mb-2">
                                        {loading
                                            ? "Loading.."
                                            : formatNumber(profitLoss?.revenue?.total - profitLoss?.cost?.total - profitLoss?.expense?.total)}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">Biaya (Expense)</h1>
                                    <span className="block text-slate-500 text-sm mb-2">
                                        Total : {loading ? "Loading.." : formatNumber(profitLoss?.expense?.total)}
                                    </span>
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {profitLoss?.expense?.accounts?.map((account, index) => (
                                                <React.Fragment key={index}>
                                                    <tr
                                                        className="text-sm border-b border-slate-300 border-dashed text-slate-600"
                                                        hidden={account.balance === 0}
                                                    >
                                                        <td colSpan={2} className="py-2 font-bold text-start">
                                                            {account.acc_name}
                                                        </td>
                                                        <td className="py-1 font-bold text-end">{formatNumber(account.balance)}</td>
                                                    </tr>
                                                    {account?.coa?.map((coa, index) => (
                                                        <tr key={index} className="text-xs" hidden={coa.balance === 0}>
                                                            <td className="text-start w-5">-</td>
                                                            <td className="py-1 text-start">{coa.acc_name}</td>
                                                            <td className="py-1 text-end">{formatNumber(coa.balance)}</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
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
export default ProfitLoss;
