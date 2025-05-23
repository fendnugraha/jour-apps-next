"use client";

import Header from "@/app/(app)/Header";
import Modal from "@/components/Modal";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { useState, useEffect } from "react";
import CreateWarehouse from "./CreateWarehouse";
import formatDateTime from "@/libs/formatDateTime";
import Notification from "@/components/notification";
import Link from "next/link";
import FormCreateAccount from "../account/formCreateAccount";
import { EyeIcon, MapPinIcon, PlusCircleIcon, SearchIcon, TrashIcon } from "lucide-react";

const Warehouse = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalCreateWarehouseOpen, setIsModalCreateWarehouseOpen] = useState(false);
    const [isModalCreateAccountOpen, setIsModalCreateAccountOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState([]); // Store validation errors
    const [isModalConfirmAlertOpen, setIsModalConfirmAlertOpen] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const closeModal = () => {
        setIsModalCreateWarehouseOpen(false);
        setIsModalCreateAccountOpen(false);
        setIsModalConfirmAlertOpen(false);
        setSelectedWarehouseId(null);
    };

    const fetchWarehouses = async (url = "/api/warehouse") => {
        setLoading(true);
        try {
            const response = await axios.get(url, {
                params: {
                    search: search,
                },
            });
            setWarehouses(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchWarehouses();
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleChangePage = (url) => {
        fetchWarehouses(url);
    };

    const handleDeleteWarehouse = async (id) => {
        try {
            const response = await axios.delete(`/api/warehouse/${id}`);
            setNotification(response.data.message);
            fetchWarehouses();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            if (error.response?.status === 403) {
                setNotification("You are not allowed to delete this warehouse.");
            }
        }
    };

    const handleModalConfirmAlert = () => {
        if (selectedWarehouseId) {
            handleDeleteWarehouse(selectedWarehouseId);
        }
        closeModal();
    };

    return (
        <>
            <Header title="Warehouse" />
            <div className="py-12">
                {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <div className="flex justify-start gap-2 mb-4">
                            <button className="btn-primary" onClick={() => setIsModalCreateWarehouseOpen(true)}>
                                Tambah Gudang <PlusCircleIcon className="w-5 h-5 inline" />
                            </button>
                            <Modal isOpen={isModalCreateWarehouseOpen} onClose={closeModal} modalTitle="Create warehouse">
                                <CreateWarehouse
                                    isModalOpen={setIsModalCreateWarehouseOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchWarehouses={fetchWarehouses}
                                />
                            </Modal>
                            <button className="btn-primary" onClick={() => setIsModalCreateAccountOpen(true)}>
                                Tambah Account <PlusCircleIcon className="w-5 h-5 inline" />
                            </button>
                            <Modal isOpen={isModalCreateAccountOpen} onClose={closeModal} modalTitle="Create account">
                                <FormCreateAccount
                                    isModalOpen={setIsModalCreateAccountOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchAccount={fetchWarehouses}
                                />
                            </Modal>
                            <Modal isOpen={isModalConfirmAlertOpen} onClose={closeModal} modalTitle="Delete warehouse">
                                <div className="text-center">
                                    <p>Are you sure you want to delete this warehouse?</p>
                                    <div className="flex justify-center gap-2 mt-4">
                                        <button onClick={handleModalConfirmAlert} className="bg-indigo-600 hover:bg-indigo-500 py-2 px-6 rounded-lg text-white">
                                            Yes
                                        </button>
                                        <button onClick={closeModal} className="bg-indigo-200 hover:bg-indigo-300 py-2 px-6 rounded-lg text-white">
                                            No
                                        </button>
                                    </div>
                                </div>
                            </Modal>
                        </div>
                        <div className="relative w-full sm:max-w-sm">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="w-6 h-6 text-gray-500" />
                            </div>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="off"
                            />
                        </div>
                        <div className="overflow-y-auto bg-white rounded-2xl relative">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
                                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                                </div>
                            )}
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th>Warehouse Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warehouses?.data?.length === 0 ? (
                                        <tr>
                                            <td colSpan="7">No warehouse found</td>
                                        </tr>
                                    ) : (
                                        warehouses?.data?.map((warehouse) => (
                                            <tr key={warehouse.id}>
                                                <td>
                                                    <span className="font-bold text-green-600">{warehouse.name}</span>
                                                    <span className="block text-xs">
                                                        {warehouse.code} | {warehouse.chart_of_account.acc_name} | {formatDateTime(warehouse.created_at)}
                                                    </span>
                                                    <span className="block text-xs">
                                                        <MapPinIcon className="w-4 h-4 inline" /> {warehouse.address}
                                                    </span>
                                                </td>

                                                <td className="w-32">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            className="bg-blue-600 hover:bg-blue-400 p-2 rounded-lg text-white"
                                                            href={`/setting/warehouse/detail/${warehouse.id}`}
                                                        >
                                                            <EyeIcon className="size-5" />
                                                        </Link>
                                                        <button
                                                            // onClick={() => handleDeleteWarehouse(warehouse.id)}
                                                            onClick={() => {
                                                                setSelectedWarehouseId(warehouse.id);
                                                                setIsModalConfirmAlertOpen(true);
                                                            }}
                                                            className="bg-red-600 hover:bg-red-400 p-2 rounded-lg text-white"
                                                        >
                                                            <TrashIcon className="size-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="px-4">{warehouses?.links && <Paginator links={warehouses} handleChangePage={handleChangePage} />}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Warehouse;
