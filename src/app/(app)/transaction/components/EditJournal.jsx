"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const EditJournal = ({ isModalOpen, journal, branchAccount, notification, fetchJournalsByWarehouse }) => {
    const [formData, setFormData] = useState({
        debt_code: "",
        cred_code: "",
        amount: "",
        fee_amount: 0,
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [accounts, setAccounts] = useState([]);

    // Update formData when journalById changes
    useEffect(() => {
        if (journal.debt_code || journal.cred_code) {
            setFormData({
                debt_code: journal.debt_code || "",
                cred_code: journal.cred_code || "",
                amount: journal.amount || "",
                fee_amount: journal.fee_amount || 0,
                description: journal.description || "",
            });
        }
    }, [journal]);

    const fetchAccounts = async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts({ account_ids: [1, 2, 6, 7, 19] });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/journals/${journal.id}`, formData);
            notification("success", response.data.message);
            fetchJournalsByWarehouse();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="relative">
            {journal.id === undefined && <div className="absolute h-full w-full flex items-center justify-center bg-white">Loading data ...</div>}
            <h1 className="text-sm sm:text-xl font-bold mb-4">
                {journal.trx_type} ({journal.invoice})
            </h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center" hidden={journal.trx_type === "Deposit Customer"}>
                    <Label>Dari</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, cred_code: e.target.value });
                            }}
                            value={formData.cred_code}
                            className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">--Pilih rekening--</option>
                            {accounts.map((br) => (
                                <option key={br.id} value={br.id}>
                                    {br.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Ke</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => {
                                setFormData({ ...formData, debt_code: e.target.value });
                            }}
                            value={formData.debt_code}
                            className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">--Pilih rekening--</option>
                            {accounts.map((br) => (
                                <option key={br.id} value={br.id}>
                                    {br.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.debt_code && <span className="text-red-500 text-xs">{errors.debt_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah</Label>
                    <div className="col-span-1">
                        <Input
                            type="number"
                            className={"w-full"}
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                    <h1 className="text-lg font-bold">{formatNumber(formData.amount)}</h1>
                </div>
                <div className="mb-2 grid-cols-1 grid sm:grid-cols-3 gap-4">
                    <Label>Keterangan</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea
                            className="w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            type="text"
                            placeholder="(Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                    </div>
                </div>
                <button
                    className="bg-green-500 hover:bg-green-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Update"}
                </button>
            </form>
        </div>
    );
};

export default EditJournal;
