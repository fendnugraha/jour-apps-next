"use client";
import React, { useCallback, useEffect, useState } from "react";
import Header from "../../Header";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Pagination from "@/components/PaginateList";
import Link from "next/link";
import exportToExcel from "@/libs/exportToExcel";
import formatDateTime from "@/libs/formatDateTime";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ProductTable = ({ warehouse, warehouseName, notification }) => {
    const [search, setSearch] = useState("");
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [errors, setErrors] = useState([]); // Store validation errors
    const [loading, setLoading] = useState(false);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchWarehouseStock = useCallback(
        async (url = `/api/get-trx-all-product-by-warehouse/${warehouse}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setWarehouseStock(response.data.data);
            } catch (error) {
                notification("error", error.response?.data?.message || "Something went wrong.");
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [endDate]
    );

    useEffect(() => {
        fetchWarehouseStock();
    }, [fetchWarehouseStock]);

    const filteredBySearch = warehouseStock.filter((item) => {
        return item.product_name.toLowerCase().includes(search.toLowerCase());
    });

    const totalItems = filteredBySearch?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredBySearch.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const summarizeTotal = (warehouseStock) => {
        let total = 0;
        warehouseStock.forEach((item) => {
            total += item.average_cost * item.total_quantity_all;
        });
        return total;
    };

    const exportStockToExcel = () => {
        const headers = [
            { key: "product_name", label: "Nama Barang" },
            { key: "total_quantity_all", label: "Qty" },
            { key: "average_cost", label: "Harga" },
            { key: "total", label: "Qty" },
        ];

        const data = [
            ...warehouseStock.map((item) => ({
                product_name: item.product_name,
                total_quantity_all: formatNumber(item.total_quantity_all),
                average_cost: formatNumber(item.average_cost),
                total: formatNumber(item.average_cost * item.total_quantity_all),
            })),
            {
                product_name: "Total",
                total_quantity_all: "",
                average_cost: "",
                total: formatNumber(summarizeTotal(warehouseStock)),
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
        <div className="bg-white rounded-3xl p-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-lg font-bold">Inventory by {warehouseName}</h1>
                    <span className="text-sm text-gray-500">
                        {endDate}, Total: {formatNumber(summarizeTotal(warehouseStock))}
                    </span>
                </div>
                <div>
                    <button
                        onClick={() => fetchWarehouseStock(`/api/get-trx-all-product-by-warehouse/${warehouse}/${endDate}`)}
                        className="bg-white font-bold p-3 mr-1 rounded-lg border border-gray-300 hover:border-gray-400"
                    >
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    <button onClick={exportStockToExcel} className="bg-white font-bold p-3 mr-1 rounded-lg border border-gray-300 hover:border-gray-400">
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
                        <Label className="font-bold">Pilih tanggal</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <button onClick={() => fetchWarehouseStock(`/api/get-trx-all-product-by-warehouse/${warehouse}/${endDate}`)} className="btn-primary">
                        Submit
                    </button>
                </Modal>
            </div>
            <div>
                <input
                    type="search"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-1/2 rounded-lg text-sm mr-1 border border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="rounded-lg border text-sm border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="10">10</option>
                    <option value="20">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <table className="w-full table text-sm">
                <thead>
                    <tr>
                        <th className="">Product Name</th>
                        <th className="">Quantity</th>
                        <th className="">Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems?.map((item, index) => (
                        <tr key={index} className="text-xs">
                            <td>
                                <Link className="hover:underline" href={`/setting/product/history/${item.product_id}`}>
                                    {item.product_name}
                                </Link>
                            </td>
                            <td className="text-end">{formatNumber(item.total_quantity_all)}</td>
                            <td className="text-end">{formatNumber(item.average_cost)}</td>
                            <td className="text-end">{formatNumber(item.average_cost * item.total_quantity_all)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan="3" className="text-end font-bold">
                            Total
                        </th>
                        <th className="text-end font-bold">{formatNumber(summarizeTotal(warehouseStock))}</th>
                    </tr>
                </tfoot>
            </table>
            {totalPages > 1 && (
                <Pagination
                    className="w-full px-4"
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ProductTable;
