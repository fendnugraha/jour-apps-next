"use client";
import SimplePagination from "@/components/SimplePagination";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { useCallback, useEffect, useState } from "react";

const WarehouseStock = ({ warehouse, notification }) => {
    const [search, setSearch] = useState("");
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchWarehouseStock = useCallback(
        async (url = `/api/warehouse-stocks/${warehouse}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setWarehouseStock(response.data.data);
            } catch (error) {
                notification("error", error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchWarehouseStock();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const filteredBySearch = warehouseStock.filter((item) => {
        return item.product?.name.toLowerCase().includes(search.toLowerCase()) || item.product?.category.toLowerCase().includes(search.toLowerCase());
    });

    const totalItems = filteredBySearch?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredBySearch.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const summarizedStock = warehouseStock.reduce((acc, item) => {
        return acc + item.current_stock;
    }, 0);
    return (
        <div className="p-4">
            <h1 className="text-lg font-bold mb-4">Inventory Stock</h1>

            <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full px-2 py-0.5 border border-gray-300 rounded-lg"
            />
            <div className="overflow-x-auto my-2">
                <table className="table w-full text-xs">
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item.id}>
                                <td className="!px-2 font-bold text-teal-600">
                                    {item.product?.name}
                                    <div className="flex justify-between">
                                        <span className="block font-normal text-slate-500">{item.product?.category}</span>
                                        <span className="block font-normal text-slate-500">{formatNumber(item.current_stock)}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h1 className="text-sm font-bold text-teal-600">
                Total Stock: <span className="font-normal">{formatNumber(summarizedStock)}</span>
            </h1>
            <div>
                {totalPages > 1 && (
                    <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                )}
            </div>
        </div>
    );
};

export default WarehouseStock;
