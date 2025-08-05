"use client";
import React, { useCallback, useEffect, useState } from "react";
import Header from "../../Header";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { ArrowBigDown, ArrowBigUp, FilterIcon, RefreshCcwIcon } from "lucide-react";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const CashFlow = () => {
    const [cashflow, setCashFlow] = useState([]);
    const [errors, setErrors] = useState([]); // Store validation errors
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchCashFlow = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/cash-flow-report/${startDate}/${endDate}`);
            setCashFlow(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchCashFlow();
    }, [fetchCashFlow]);

    const calculatePercentageCashChange = () => {
        if (!cashflow?.start_balance || cashflow?.start_balance === 0) return "0%";
        const change = ((cashflow.end_balance - cashflow.start_balance) / cashflow.start_balance) * 100;
        return `${change.toFixed(2)}%`;
    };

    const formatLongDate = (dateString) => {
        const tanggal = new Date(dateString);
        const formatted = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(tanggal);

        return formatted;
    };
    console.log(cashflow);
    return (
        <>
            <Header title="Arus Kas (Cashflow Statement)" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-5 flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-blue-600">Arus Kas (Cashflow Statement)</h1>
                                    <span className="block text-sm text-slate-400">
                                        Periode : {formatLongDate(startDate)} s/d {formatLongDate(endDate)}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={fetchCashFlow}
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
                                    <button onClick={() => fetchCashFlow()} disabled={loading} className="btn-primary">
                                        Submit
                                    </button>
                                </Modal>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    {cashflow?.revenue?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 font-bold">Pendapatan (Revenue)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.revenue?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.revenue?.accounts?.map((account, index) => (
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
                                    {cashflow?.inventory?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 mt-5 font-bold">Persediaan (Inventory)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.inventory?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.inventory?.accounts?.map((account, index) => (
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
                                    {cashflow?.receivable?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 mt-5 font-bold">Piutang (Receivable)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.receivable?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.receivable?.accounts?.map((account, index) => (
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
                                    {cashflow?.payable?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 mt-5 font-bold">Hutang (Payable)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.payable?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.payable?.accounts?.map((account, index) => (
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
                                    {cashflow?.assets?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 mt-5 font-bold">Aset Lancar (Assets)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.assets?.total)}
                                            </span>
                                        </>
                                    )}

                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.assets?.accounts?.map((account, index) => (
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
                                <div>
                                    {cashflow?.equity?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 font-bold">Modal (Equity)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.equity?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.equity?.accounts?.map((account, index) => (
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
                                    {cashflow?.expense?.total !== 0 && (
                                        <>
                                            <h1 className="text-lg text-slate-700 mt-5 font-bold">Biaya - Biaya (Expense)</h1>
                                            <span className="block font-bold text-slate-500 text-sm mb-2">
                                                {loading ? "Calculating.." : formatNumber(cashflow?.expense?.total)}
                                            </span>
                                        </>
                                    )}
                                    <table className="table-auto w-full">
                                        <tbody>
                                            {cashflow?.expense?.accounts?.map((account, index) => (
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
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h1 className="text-lg text-slate-700 font-bold">Total Kas Awal (Start Balance)</h1>
                                    <span className="block text-slate-500 text-lg font-bold">{formatNumber(cashflow?.start_balance || 0)}</span>
                                </div>
                                <div>
                                    <h1 className="text-lg text-slate-700 font-bold">Total Kas Akhir (End Balance)</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="block text-slate-500 text-lg font-bold">{formatNumber(cashflow?.end_balance || 0)}</span>
                                        <div>
                                            {cashflow?.end_balance - cashflow?.start_balance > 0 ? (
                                                <>
                                                    <ArrowBigUp size={26} className="inline text-green-500" />
                                                    <span className="text-green-500 text-sm font-bold">{calculatePercentageCashChange()}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowBigDown size={26} className="inline text-red-500" />
                                                    <span className="text-red-500 text-sm font-bold">{calculatePercentageCashChange()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default CashFlow;
