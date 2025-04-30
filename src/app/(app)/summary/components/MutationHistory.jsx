"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import formatDateTime from "@/libs/formatDateTime";
import { ArrowRightIcon, MessageCircleWarningIcon, TrashIcon } from "lucide-react";
import { FilterIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Paginator from "@/components/Paginator";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const MutationHistory = ({ account, notification, user }) => {
    const warehouseCashId = user?.role?.warehouse?.chart_of_account_id;
    const [search, setSearch] = useState("");
    const [mutation, setMutation] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedAccount, setSelectedAccount] = useState(warehouseCashId);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchMutation = async (url = `/api/mutation-history/${selectedAccount}/${startDate}/${endDate}`) => {
        setLoading(true);
        try {
            const response = await axios.get(url, {
                params: {
                    search: search,
                },
            });
            setMutation(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutation();
    }, [selectedAccount]);

    const handleChangePage = (url) => {
        fetchMutation(url);
    };

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification(response.data.message);
            fetchMutation();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };
    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4">
                <h4 className="mb-4 text-blue-950 text-lg font-bold">
                    Riwayat Mutasi
                    <span className="text-xs block font-normal text-slate-500">
                        Periode: {startDate} - {endDate}
                    </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3 mb-2">
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Saldo Awal</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.initBalance || 0)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Debet</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.debt_total || 0)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Credit</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.cred_total || 0)}</span>
                    </div>
                    <div className="bg-sky-700 p-2 sm:px-4 sm:py-2 rounded-xl text-white">
                        <h5 className="sm:text-xs">Saldo Akhir</h5>
                        <span className="sm:text-xl font-bold">{formatNumber(mutation?.endBalance || 0)}</span>
                    </div>
                </div>
            </div>
            <div className="mb-2 px-4 flex gap-2">
                <select
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    value={selectedAccount}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                >
                    <option value="0">Pilih Akun</option>
                    {account?.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.acc_name}
                        </option>
                    ))}
                </select>
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
                    <button onClick={() => fetchMutation()} className="btn-primary">
                        Submit
                    </button>
                </Modal>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full text-xs">
                    <thead>
                        <tr>
                            <th>Keterangan</th>
                            <th>Jumlah</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={2}>Loading...</td>
                            </tr>
                        ) : selectedAccount > 0 ? (
                            mutation.journals?.data?.length > 0 ? (
                                mutation.journals?.data?.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className="text-xs text-slate-500 block">
                                                #{item.id} {item.invoice} | {formatDateTime(item.date_issued)}
                                            </span>
                                            Note: {item.description}
                                            <span className="block font-bold text-xs">
                                                {item.cred.acc_name} <ArrowRightIcon className="size-4 inline" /> {item.debt.acc_name}
                                            </span>
                                        </td>
                                        <td className="font-bold">
                                            <span
                                                className={`${Number(item.debt_code) === Number(selectedAccount) ? "text-green-500" : ""}
                                            ${Number(item.cred_code) === Number(selectedAccount) ? "text-red-500" : ""}
                                                text-sm md:text-base sm:text-lg`}
                                            >
                                                {formatNumber(item.amount)}
                                            </span>
                                            {item.fee_amount !== 0 && <span className="text-xs text-blue-600 block">{formatNumber(item.fee_amount)}</span>}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedJournalId(item.id);
                                                    setIsModalDeleteJournalOpen(true);
                                                }}
                                                disabled={["Voucher & SP", "Accessories", null].includes(item.trx_type)}
                                                className=" disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 hover:scale-125 transtition-all duration-200"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2}>Tidak ada data.</td>
                                </tr>
                            )
                        ) : (
                            <tr>
                                <td colSpan={2}>Silahkan pilih akun.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                        <MessageCircleWarningIcon size={72} className="text-red-600" />
                        <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedJournalId})?</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => {
                                handleDeleteJournal(selectedJournalId);
                                setIsModalDeleteJournalOpen(false);
                            }}
                            className="btn-primary w-full"
                        >
                            Ya
                        </button>
                        <button
                            onClick={() => setIsModalDeleteJournalOpen(false)}
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Tidak
                        </button>
                    </div>
                </Modal>
            </div>
            {mutation.journals?.last_page > 1 && (
                <div className="px-4">
                    <Paginator links={mutation.journals} handleChangePage={handleChangePage} />
                </div>
            )}
        </div>
    );
};

export default MutationHistory;
