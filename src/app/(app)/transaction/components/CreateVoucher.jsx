import { useState, useEffect } from "react";
import axios from "@/libs/axios";
import Label from "@/components/Label";
import Input from "@/components/Input";
import formatNumber from "@/libs/formatNumber";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import useGetProducts from "@/libs/getAllProducts";

const CreateVoucher = ({ isModalOpen, notification, fetchJournalsByWarehouse, user }) => {
    const [formData, setFormData] = useState({
        product_id: "",
        qty: 0,
        price: 0,
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const { products, productsError, isValidating } = useGetProducts();
    const filteredProducts = products?.data?.filter((product) => product.category === "Voucher & SP");
    const incrementQty = (e) => {
        e.preventDefault();
        setFormData({ ...formData, qty: formData.qty + 1 });
    };

    const decrementQty = (e) => {
        e.preventDefault();
        if (formData.qty > 1) {
            setFormData({ ...formData, qty: formData.qty - 1 });
        }
    };

    const selectedProduct = () => {
        const product = filteredProducts?.find((product) => product.id === Number(formData.product_id));
        return product;
    };

    useEffect(() => {
        if (selectedProduct()) {
            setFormData({ ...formData, price: selectedProduct().price });
        }
    }, [formData.product_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-voucher", formData);
            notification("success", response.data.message);
            fetchJournalsByWarehouse();
            setFormData({
                product_id: "",
                qty: 0,
                price: 0,
                description: "",
            });
            setErrors([]);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Product</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value, qty: 1 })}
                        value={formData.product_id}
                        disabled={isValidating}
                        className="w-full text-sm rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">--Pilih barang--</option>
                        {filteredProducts?.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} {" -> "} Rp. {formatNumber(product.price)}
                            </option>
                        ))}
                    </select>
                    {errors.product_id && <span className="text-red-500 text-xs">{errors.product_id}</span>}
                </div>
            </div>
            <div className="my-4 grid grid-cols-3 gap-4 items-center">
                <Label>Qty</Label>
                <div className="col-span-2 flex items-center gap-2">
                    <button
                        className="hover:text-red-600 active:scale-95 disabled:text-slate-400 disabled:cursor-not-allowed"
                        onClick={decrementQty}
                        disabled={formData.qty <= 1}
                    >
                        <MinusCircleIcon className="w-6 h-6" />
                    </button>
                    <span className="text-md text-center min-w-5">{formData.qty}</span>
                    <button
                        className="hover:text-red-600 active:scale-95 disabled:text-slate-400 disabled:cursor-not-allowed"
                        onClick={incrementQty}
                        disabled={formData.product_id === ""}
                    >
                        <PlusCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-4 items-center">
                <Label>Harga</Label>
                <div className="col-span-1">
                    <Input
                        className={"w-full text-sm"}
                        type="number"
                        placeholder="Rp."
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
                </div>
                <span className="text-sm sm:text-lg font-bold">Rp. {formatNumber(formData.qty * formData.price)}</span>
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
    );
};

export default CreateVoucher;
