"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Link from "next/link";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const WarehouseBalance = () => {
    const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchWarehouseBalance = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-warehouse-balance/${endDate}`);
            setWarehouseBalance(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouseBalance();
    }, []);
    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4 flex justify-between">
                <h4 className=" text-blue-950 text-lg font-bold">
                    Saldo Kas & bank
                    <span className="text-xs text-slate-500 block font-normal">Periode: {endDate}</span>
                </h4>
                <div className="flex gap-1">
                    <button
                        onClick={fetchWarehouseBalance}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                        disabled={true}
                    >
                        <DownloadIcon className="size-4" />
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
                        <Label className="font-bold">Tanggal</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <button onClick={fetchWarehouseBalance} className="btn-primary">
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead className="">
                        <tr className="">
                            <th className="text-center">Cabang (Konter)</th>
                            <th className="text-center">Kas Tunai</th>
                            <th className="text-center">Saldo Bank</th>
                            <th className="text-center">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        ) : (
                            warehouseBalance.warehouse?.map((w, i) => (
                                <tr className="hover:bg-gray-100" key={i}>
                                    <td className="">
                                        <Link className="hover:underline" href={`/summary/warehouse/${w.id}`}>
                                            {w.name}
                                        </Link>
                                    </td>
                                    <td className="text-end">{formatNumber(w.cash)}</td>
                                    <td className="text-end">{formatNumber(w.bank)}</td>
                                    <td className="text-end font-bold">{formatNumber(w.cash + w.bank)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        {loading ? (
                            <tr>
                                <td colSpan={4}>Loading...</td>
                            </tr>
                        ) : (
                            <tr>
                                <th>Total</th>
                                <th>{formatNumber(warehouseBalance.totalCash)}</th>
                                <th>{formatNumber(warehouseBalance.totalBank)}</th>
                                <th>{formatNumber(warehouseBalance.totalCash + warehouseBalance.totalBank)}</th>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default WarehouseBalance;
