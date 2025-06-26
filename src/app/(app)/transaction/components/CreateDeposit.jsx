import axios from "@/libs/axios";
import { useState } from "react";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";

const CreateDeposit = ({ isModalOpen, filteredCashBankByWarehouse, notification, fetchJournalsByWarehouse, user, today }) => {
    const [formData, setFormData] = useState({
        dateIssued: today,
        debt_code: "",
        cred_code: 8,
        amount: "",
        trx_type: "Deposit Customer",
        fee_amount: 0,
        description: "",
        custName: "General",
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
                debt_code: formData.debt_code,
                cred_code: 8,
                amount: "",
                trx_type: "Deposit Customer",
                fee_amount: 0,
                description: "",
                custName: "General",
            });
            fetchJournalsByWarehouse();
            // isModalOpen(false);
            setErrors([]);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Tanggal</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            className="w-full text-xs sm:text-sm"
                            type="datetime-local"
                            placeholder="Rp."
                            value={formData.dateIssued || today}
                            onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                        />
                        {errors.date_issued && <span className="text-red-500 text-xs">{errors.date_issued}</span>}
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Ke Rekening</Label>
                    <div className="col-span-1 sm:col-span-2">
                        <select
                            onChange={(e) => setFormData({ ...formData, debt_code: e.target.value })}
                            value={formData.debt_code}
                            className="w-full text-sm rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={formData.debt_code === 9}
                        >
                            <option value="">--Pilih Rekening--</option>
                            {filteredCashBankByWarehouse.map((cashBank) => (
                                <option key={cashBank.id} value={cashBank.id}>
                                    {cashBank.acc_name}
                                </option>
                            ))}
                        </select>
                        {errors.debt_code && <span className="text-red-500 text-xs">{errors.debt_code}</span>}
                    </div>
                </div>

                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <div></div>
                    <div className="col-span-1 sm:col-span-2 flex items-center gap-2.5">
                        <input
                            id="deposit_customer"
                            type="checkbox"
                            checked={formData.debt_code === 9}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    debt_code: e.target.checked ? 9 : "",
                                    description: e.target.checked ? "Tukar Komisi Penjualan ke Deposit" : "Deposit Customer",
                                })
                            }
                        />
                        <Label htmlFor="deposit_customer">Tukar Komisi (Fee Customer)</Label>
                    </div>
                </div>
                <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                    <Label>Jumlah Deposit</Label>
                    <div className="col-span-1">
                        <Input
                            className={"w-full text-sm"}
                            type="number"
                            placeholder="Rp."
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            autoFocus={true}
                        />
                        {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                    </div>
                    <h1 className="textsm sm:text-lg font-bold">{formatNumber(formData.amount)}</h1>
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
                            className="w-full text-sm rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

export default CreateDeposit;
