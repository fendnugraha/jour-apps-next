"use client";
import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateTransfer = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user }) => {
    const [formData, setFormData] = useState({
        debt_code: user.role.warehouse.chart_of_account_id,
        cred_code: "",
        amount: "",
        fee_amount: "",
        trx_type: "Transfer Uang",
        description: "",
        custName: "",
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-transfer", formData);
            notification("success", response.data.message);
            setFormData({
                debt_code: user.role.warehouse.chart_of_account_id,
                cred_code: formData.cred_code,
                amount: "",
                trx_type: "Transfer Uang",
                fee_amount: "",
                description: "",
                custName: "",
            });
            fetchJournalsByWarehouse();
            // isModalOpen(false);
            setErrors([]);
        } catch (error) {
            setErrors(error.response.data.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Dari Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                            value={formData.cred_code}
                            className="w-full text-sm rounded-md shadow-sm p-2 border border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse.map((cashBank) => (
                                <option key={cashBank.id} value={cashBank.id}>
                                    {cashBank.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah transfer</Label>
                    <div>
                        <Input
                            className="w-full text-sm"
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                    <h1 className="text-sm sm:text-lg font-bold">{formatNumber(formData.amount)}</h1>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Fee (Admin)</Label>
                    <div className="">
                        <Input
                            className={"w-full sm:w-3/4 text-sm"}
                            type="number"
                            placeholder="Rp."
                            value={formData.fee_amount}
                            onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                        />
                        {errors.fee_amount && <span className="text-red-500 text-xs">{errors.fee_amount}</span>}
                    </div>
                    <h1 className="text-sm sm:text-lg font-bold">{formatNumber(formData.fee_amount)}</h1>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Nama Rek. Customer</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            className={"w-full text-sm"}
                            type="text"
                            placeholder="Atasnama"
                            value={formData.custName}
                            onChange={(e) => setFormData({ ...formData, custName: e.target.value })}
                        />
                        {errors.custName && <span className="text-red-500 text-xs">{errors.custName}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Keterangan</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <textarea
                            className="w-full text-sm rounded-md shadow-sm p-2 border border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            type="text"
                            placeholder="(Optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => isModalOpen(false)}
                        type="button"
                        className="bg-white border border-red-300 hover:bg-red-200 rounded-xl px-8 py-3 text-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Simpan"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateTransfer;
