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
                        className="bg-white font-bold p-3 mr-2 rounded-lg border border-gray-300 hover:border-gray-400"
                    >
                        <RefreshCcwIcon className="size-4" />
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
                            <td>{item.product_name}</td>
                            <td className="text-end">{formatNumber(item.total_quantity_all)}</td>
                            <td className="text-end">{formatNumber(item.average_cost)}</td>
                            <td className="text-end">{formatNumber(item.average_cost * item.total_quantity_all)}</td>
                        </tr>
                    ))}
                </tbody>
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
