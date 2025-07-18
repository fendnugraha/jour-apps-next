import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { useState } from "react";

const EditTransaction = ({ isModalOpen, transaction, notification, fetchTransaction }) => {
    const [formData, setFormData] = useState({
        quantity: transaction?.transaction_type === "Sales" ? transaction?.quantity * -1 : transaction?.quantity,
        price: transaction?.transaction_type === "Sales" ? transaction?.price : transaction?.cost,
    });
    const [loading, setLoading] = useState(false);

    const handleUpdateTransaction = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/transactions/${transaction?.id}`, formData);
            notification("success", response.data.message);
            fetchTransaction();
            isModalOpen(false);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <div className="flex justify-between">
                <h1>ID: {transaction.id}</h1>
                <h1>{transaction.transaction_type}</h1>
            </div>
            <h1 className="font-bold">{transaction.product?.name}</h1>
            <div className="mt-2">
                <div className="mb-2">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        className="w-full p-2 border border-slate-300  rounded-lg"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                </div>
                <div className="mb-2">
                    <label htmlFor="price">Harga</label>
                    <input
                        type="number"
                        id="price"
                        className="w-full p-2 border border-slate-300  rounded-lg"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <span>Total: {formatNumber(formData.quantity * formData.price)}</span>
                </div>
                <button
                    type="button"
                    disabled={loading}
                    onClick={handleUpdateTransaction}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Update"}
                </button>
            </div>
        </div>
    );
};

export default EditTransaction;
