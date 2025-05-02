"use client";

import { useEffect, useState } from "react";
import axios from "@/libs/axios";
import { DownloadIcon, FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { formatDistanceToNow } from "date-fns";
import formatDateTime from "@/libs/formatDateTime";
import Paginator from "@/components/Paginator";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const LogActivity = () => {
    const [logActivity, setLogActivity] = useState([]);
    const [notification, setNotification] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const fetchLogActivity = async (url = `/api/log-activity/${startDate}/${endDate}`) => {
        setLoading(true);
        try {
            const response = await axios.get(url);
            setLogActivity(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogActivity();
    }, []);

    const handleChangePage = (url) => {
        fetchLogActivity(url);
    };

    return (
        <div className="bg-white rounded-lg mb-3 relative">
            <div className="p-4 flex justify-between">
                <h4 className=" text-blue-950 text-lg font-bold">
                    Log Activity
                    <span className="text-xs block text-slate-500 font-normal">
                        Periode: {startDate} - {endDate}
                    </span>
                </h4>
                <div className="flex gap-1">
                    <button
                        onClick={() => fetchLogActivity()}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        <RefreshCcwIcon className="size-4" />
                    </button>
                    {/* <button className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed">
                        <DownloadIcon className="size-4" />
                    </button> */}
                    <button
                        onClick={() => setIsModalFilterDataOpen(true)}
                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                    >
                        <FilterIcon className="size-4" />
                    </button>
                    <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                        <div className="mb-4">
                            <Label className="font-bold">Tanggal</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <div className="mb-4">
                            <Label className="font-bold">s/d</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <button onClick={() => fetchLogActivity()} className="btn-primary">
                            Submit
                        </button>
                    </Modal>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-xs mb-2">
                    {/* <thead className="">
                        <tr>
                            <th className="border-y px-2 py-1">Description</th>
                        </tr>
                    </thead> */}
                    <tbody>
                        {logActivity?.data?.map((item, index) => (
                            <tr key={index} className="border-b border-slate-300 last:border-none">
                                <td className=" px-2 py-1 whitespace-normal break-words max-w-xs">
                                    <span className="text-xs block text-slate-500 font-bold">
                                        {item.user.name} {item.activity} at {item.warehouse.name}. Log ID: {item.id}
                                    </span>
                                    {item.description}
                                    <span className="text-xs block text-slate-500 font-normal">
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })} at {formatDateTime(item.created_at)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {logActivity.last_page > 1 && (
                <div className="px-4">
                    <Paginator links={logActivity} handleChangePage={handleChangePage} />
                </div>
            )}
        </div>
    );
};

export default LogActivity;
