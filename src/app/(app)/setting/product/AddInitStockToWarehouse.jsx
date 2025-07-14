import axios from "@/libs/axios";
import { set } from "date-fns";
import { useEffect, useState } from "react";

const AddInitStockToWarehouse = ({ selectedProductById, notification }) => {
    const [formData, setFormData] = useState({
        product_id: selectedProductById?.id,
        warehouse_id: "",
        init_stock: "",
    });
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);

    useEffect(() => {
        // Add form validation logic here
        const fetchWarehouses = async () => {
            try {
                const response = await axios.get("/api/get-all-warehouses");
                setWarehouses(response.data.data);
            } catch (error) {
                notification("error", error.response?.data?.message || "Something went wrong.");
            }
        };
        fetchWarehouses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/warehouse-stocks", formData);
            notification("success", response.data.message);
            setFormData({
                product_id: selectedProductById?.id,
                warehouse_id: "",
                init_stock: "",
            });
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-lg font-bold">{selectedProductById?.name}</h1>
            <form onSubmit={handleSubmit} className="my-2">
                <div className="mb-4">
                    <label>Cabang</label>
                    <select
                        className="w-full border border-slate-300 rounded-md p-2 bg-slate-100"
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    >
                        <option value="">Pilih Cabang</option>
                        {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label>Stok Awal</label>
                    <input
                        type="number"
                        value={formData.init_stock}
                        onChange={(e) => setFormData({ ...formData, init_stock: e.target.value })}
                        placeholder="Rp"
                        className="w-full border border-slate-300 rounded-md p-2 bg-slate-100"
                    />
                </div>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl disabled:opacity-50" disabled={loading}>
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </form>
        </div>
    );
};

export default AddInitStockToWarehouse;
