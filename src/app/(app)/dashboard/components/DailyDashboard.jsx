"use client";
import formatNumber from "@/libs/formatNumber";
import axios from "@/libs/axios";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import { BriefcaseIcon, FilterIcon, LoaderIcon, PercentCircleIcon, ReceiptTextIcon, RefreshCcwIcon, WalletCardsIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { formatNumberToK } from "@/libs/formatNumberToK";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const fetcher = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data?.errors || ["Something went wrong."];
    }
};
export async function getServerSideProps(context) {
    const { warehouse } = context.query;
    const today = new Date().toISOString().split("T")[0];

    const res = await axios.get(`/api/daily-dashboard/${warehouse || "all"}/${today}/${today}`);

    return { props: { initialData: res.data, initialWarehouse: warehouse || "all" } };
}
const useGetdailyDashboard = (warehouse, endDate, initialData) => {
    const {
        data: dailyDashboard,
        error,
        isValidating,
    } = useSWR(`/api/daily-dashboard/${warehouse}/${endDate}`, fetcher, {
        fallbackData: initialData,
        revalidateOnFocus: true,
        dedupingInterval: 60000,
    });

    return { dailyDashboard, loading: isValidating, error };
};

const DailyDashboard = ({ notification, warehouse, warehouses, userRole }) => {
    const [filterData, setFilterData] = useState({
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const { dailyDashboard, loading: isValidating, error } = useGetdailyDashboard(selectedWarehouse, endDate);

    const handleFilterData = () => {
        setEndDate(filterData.endDate);
        setIsModalFilterDataOpen(false);
    };

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    useEffect(() => {
        mutate(`/api/daily-dashboard/${selectedWarehouse}/${endDate}`);
    }, [selectedWarehouse, endDate]);

    const netProfit = dailyDashboard?.data?.revenue - dailyDashboard?.data?.cost - dailyDashboard?.data?.expense;
    const netProfitPercentage = ((netProfit / dailyDashboard?.data?.revenue) * 100).toFixed(2);

    const cashBank = dailyDashboard?.data?.cash + dailyDashboard?.data?.bank;
    return (
        <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="mb-2 flex gap-2 px-2">
                    {userRole === "Administrator" && (
                        <select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        >
                            <option value="all">Semua Cabang</option>
                            {warehouses?.data?.map((warehouse) => (
                                <option key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => setIsModalFilterDataOpen(true)}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                    >
                        <FilterIcon className="size-4" />
                    </button>
                </div>
                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                    <div className="mb-4">
                        <Label className="font-bold">Tanggal</Label>
                        <Input
                            type="date"
                            value={filterData.endDate}
                            onChange={(e) => setFilterData({ ...filterData, endDate: e.target.value })}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <button
                        onClick={() => {
                            // mutate(`/api/daily-dashboard/${selectedWarehouse}/${startDate}/${endDate}`);
                            // setIsModalFilterDataOpen(false);
                            handleFilterData();
                        }}
                        className="btn-primary"
                    >
                        Submit
                    </button>
                </Modal>
                <div className="flex flex-end items-center px-2">
                    <h1 className="text-sm font-bold text-center sm:text-end text-slate-500 w-full">
                        {selectedWarehouse === "all" ? "Semua Cabang" : warehouses?.data?.find((warehouse) => warehouse.id === selectedWarehouse)?.name},
                        Periode: {endDate}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-4 grid-rows-4 gap-4 h-[550px]">
                <div className="bg-violet-500 text-white px-3 py-4 rounded-2xl">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Assets</h1>
                            <WalletCardsIcon className="w-8 h-8 inline" />
                        </div>
                        <h1 className="text-3xl font-semibold">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.assets)}</h1>
                    </div>
                </div>
                <div className="bg-violet-500 text-white px-3 py-4 rounded-2xl">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Liabilities</h1>
                            <ReceiptTextIcon className="w-8 h-8 inline" />
                        </div>
                        <h1 className="text-3xl font-semibold">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.liabilities)}</h1>
                    </div>
                </div>
                <div className="bg-violet-500 text-white px-3 py-4 rounded-2xl">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Equity</h1>
                            <BriefcaseIcon className="w-8 h-8 inline" />
                        </div>
                        <h1 className="text-3xl font-semibold">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.equity + netProfit)}</h1>
                    </div>
                </div>
                <div className="row-span-3 flex h-full justify-between gap-4 flex-col">
                    <div className="flex gap-2 justify-between items-center bg-amber-300 h-full rounded-2xl px-3 py-4">
                        <PercentCircleIcon className="w-8 h-8 inline text-slate-400" />
                        <div className="flex flex-col items-end">
                            <h1 className="text-sm font-bold text-slate-600">Debt Ratio</h1>
                            <span className="text-xl font-bold ">{((dailyDashboard?.data?.liabilities / dailyDashboard?.data?.assets) * 100).toFixed(2)}%</span>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-between items-center bg-amber-300 h-full rounded-2xl px-3 py-4">
                        <PercentCircleIcon className="w-8 h-8 inline text-slate-400" />
                        <div className="flex flex-col items-end">
                            <h1 className="text-sm font-bold text-slate-600">Current Ratio</h1>
                            <span className="text-xl font-bold ">{((dailyDashboard?.data?.assets / dailyDashboard?.data?.liabilities) * 100).toFixed(2)}%</span>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-between items-center bg-amber-300 h-full rounded-2xl px-3 py-4">
                        <PercentCircleIcon className="w-8 h-8 inline text-slate-400" />
                        <div className="flex flex-col items-end">
                            <h1 className="text-sm font-bold text-slate-600">Debt to Equity Ratio</h1>
                            <span className="text-xl font-bold ">
                                {((dailyDashboard?.data?.liabilities / (dailyDashboard?.data?.equity + netProfit)) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-between items-center bg-amber-300 h-full rounded-2xl px-3 py-4">
                        <PercentCircleIcon className="w-8 h-8 inline text-slate-400" />
                        <div className="flex flex-col items-end">
                            <h1 className="text-sm font-bold text-slate-600">Return to Equity Ratio</h1>
                            <span className="text-xl font-bold ">
                                {((dailyDashboard?.data?.netProfitCurrentMonth / (dailyDashboard?.data?.equity + netProfit)) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="bg-white px-3 py-4 rounded-2xl col-span-2 row-span-2 flex flex-col justify-between gap-4">
                    {" "}
                    <div className="flex flex-col gap-2 justify-start">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Saldo Kas & Bank</h1>
                            <WalletCardsIcon className="w-8 h-8 inline text-slate-600" />
                        </div>
                        <h1 className="text-5xl font-semibold  text-slate-500">
                            {isValidating ? "loading.." : formatNumber(dailyDashboard?.data?.cash + dailyDashboard?.data?.bank)}
                        </h1>
                    </div>
                    <div className="grid grid-cols-2 gap-2 h-full">
                        <div className="flex justify-evenly items-center flex-col gap-2 bg-violet-100 rounded-2xl">
                            <h1 className="font-bold text-xl text-slate-700">Total Cash</h1>
                            <h1 className="text-4xl font-semibold text-violet-500">
                                {isValidating
                                    ? ".."
                                    : ((dailyDashboard?.data?.cash / (dailyDashboard?.data?.cash + dailyDashboard?.data?.bank)) * 100).toFixed(2)}
                                %
                            </h1>
                            <h1 className="font-semibold text-slate-500">{isValidating ? "loading.." : formatNumber(dailyDashboard?.data?.cash)}</h1>
                        </div>
                        <div className="flex justify-evenly items-center flex-col gap-2 bg-violet-100 rounded-2xl">
                            <h1 className="font-bold text-xl text-slate-700">Total Bank</h1>
                            <h1 className="text-4xl font-semibold text-violet-500">
                                {isValidating
                                    ? ".."
                                    : ((dailyDashboard?.data?.bank / (dailyDashboard?.data?.cash + dailyDashboard?.data?.bank)) * 100).toFixed(2)}
                                %
                            </h1>
                            <h1 className="font-semibold text-slate-500">{isValidating ? "loading.." : formatNumber(dailyDashboard?.data?.bank)}</h1>
                        </div>
                    </div>
                </div>
                <div className="bg-white px-3 py-4 rounded-2xl col-start-3">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Piutang</h1>
                            <WalletCardsIcon className="w-8 h-8 inline text-slate-600" />
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-500">
                            {isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.receivable)}
                        </h1>
                    </div>
                </div>
                <div className="bg-white px-3 py-4 rounded-2xl col-start-3 row-start-3">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Hutang</h1>
                            <WalletCardsIcon className="w-8 h-8 inline text-slate-600" />
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-500">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.payable)}</h1>
                    </div>
                </div>
                <div className="bg-green-200 px-3 py-4 rounded-2xl row-start-4">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">Pendapatan</h1>
                            <WalletCardsIcon className="w-8 h-8 inline text-green-700" />
                        </div>
                        <h1 className="text-3xl font-semibold text-green-700">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.revenue)}</h1>
                    </div>
                </div>
                <div className="bg-green-200 px-3 py-4 rounded-2xl row-start-4">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <h1 className="text-xl font-bold">HPP</h1>
                            <WalletCardsIcon className="w-8 h-8 inline text-green-700" />
                        </div>
                        <h1 className="text-3xl font-semibold text-green-700">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.cost)}</h1>
                    </div>
                </div>
                <div className="bg-green-200 px-3 py-4 rounded-2xl row-start-4">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <div>
                                <h1 className="text-xl font-bold">Biaya</h1>
                                <span className="text-sm font-bold text-green-700">
                                    {((dailyDashboard?.data?.expense / dailyDashboard?.data?.revenue) * 100).toFixed(2)}%
                                </span>
                            </div>
                            <WalletCardsIcon className="w-8 h-8 inline text-green-700" />
                        </div>
                        <h1 className="text-3xl font-semibold text-green-700">{isValidating ? "loading.." : formatNumberToK(dailyDashboard?.data?.expense)}</h1>
                    </div>
                </div>
                <div className="bg-green-200 px-3 py-4 rounded-2xl row-start-4">
                    <div className="flex flex-col gap-2 justify-between h-full">
                        <div className="flex items-start gap-2 justify-between">
                            <div>
                                <h1 className="text-xl font-bold">Net Profit</h1>
                                <span className="text-sm font-bold text-green-700">
                                    {isValidating ? "loading.." : ((netProfit / dailyDashboard?.data?.revenue) * 100).toFixed(2)}%
                                </span>
                            </div>
                            <WalletCardsIcon className="w-8 h-8 inline text-green-700" />
                        </div>

                        <h1 className="text-3xl font-semibold text-green-700">{isValidating ? "loading.." : formatNumberToK(netProfit)}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyDashboard;
