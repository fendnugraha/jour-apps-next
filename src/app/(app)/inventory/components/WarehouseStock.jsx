"use client";
import SimplePagination from "@/components/SimplePagination";
import axios from "@/libs/axios";
import exportToExcel from "@/libs/exportToExcel";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { DownloadIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const WarehouseStock = ({ warehouse, warehouseName, notification }) => {
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

    const exportStockToExcel = () => {
        const headers = [
            { key: "product_name", label: "Nama Barang" },
            { key: "category", label: "Kategori" },
            { key: "current_stock", label: "Qty" },
        ];

        const data = [
            ...warehouseStock.map((item) => ({
                product_name: item.product.name,
                category: item.product.category,
                current_stock: formatNumber(item.current_stock),
            })),
            {
                product_name: "Total",
                category: "",
                current_stock: formatNumber(summarizedStock),
            },
        ];

        exportToExcel(
            data,
            headers,
            `Laporan Stok Gudang ${warehouseName} ${formatDateTime(new Date())}.xlsx`,
            `Laporan Stok Gudang ${warehouseName} ${formatDateTime(new Date())}`
        );
    };
    return (
        <div className="p-4">
            <div className="mb-4 flex justify-between">
                <h1 className="text-lg font-bold">Inventory Stock</h1>
                <button
                    onClick={exportStockToExcel}
                    className="cursor-pointer bg-white font-bold p-2 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    <DownloadIcon className="size-3" />
                </button>
            </div>
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
