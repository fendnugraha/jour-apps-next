"use client";
import { useState, useEffect } from "react";
import Header from "../../Header";
import Notification from "@/components/notification";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import Modal from "@/components/Modal";
import CreateUser from "./CreateUser";
import Paginator from "@/components/Paginator";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuildingIcon, MailIcon, PencilIcon, PlusCircleIcon, SearchIcon, SmileIcon, StoreIcon, Trash2Icon } from "lucide-react";
import TimeAgo from "@/libs/formatDateDistance";
import MainPage from "../../main";

const User = () => {
    const router = useRouter();
    const [notification, setNotification] = useState("");
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const fetchUsers = async (url = "/api/users") => {
        setLoading(true);
        try {
            const response = await axios.get(url, {
                params: {
                    search: search,
                },
            });
            setUsers(response.data.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleChangePage = (url) => {
        fetchUsers(url);
    };

    const [isModalCreateUserOpen, setIsModalCreateUserOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateUserOpen(false);
    };

    const handleDeleteUser = async (id) => {
        try {
            const response = await axios.delete(`/api/users/${id}`);
            setNotification(response.data.message);
            fetchUsers();
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        }
    };
    return (
        <MainPage headerTitle="User Management">
            <div className="overflow-hidden">
                {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
                <button onClick={() => setIsModalCreateUserOpen(true)} className="btn-primary text-sm mb-4">
                    Tambah User <PlusCircleIcon className="size-4 inline" />
                </button>
                <Modal isOpen={isModalCreateUserOpen} onClose={closeModal} modalTitle="Create User">
                    <CreateUser isModalOpen={setIsModalCreateUserOpen} notification={(message) => setNotification(message)} fetchUsers={fetchUsers} />
                </Modal>
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
                <div className="overflow-x-auto bg-white rounded-2xl relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
                        </div>
                    )}
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th className="">Name</th>
                                <th className="">Role</th>
                                <th className="">Warehouse</th>
                                <th className="">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td className="border-b p-2" colSpan={3}>
                                        Loading ...
                                    </td>
                                </tr>
                            ) : (
                                users?.data?.map((user) => (
                                    <tr key={user.id}>
                                        <td className="border-b p-2">
                                            <span className="font-bold">{user.name}</span>
                                            <span className="text-xs block">
                                                <MailIcon className="h-4 w-4 inline" /> {user.email}
                                            </span>
                                            <span className="text-xs block text-slate-500">
                                                Last update at <TimeAgo timestamp={user.updated_at} />
                                            </span>
                                        </td>
                                        <td className="border-b p-2">{user.role?.role}</td>
                                        <td className="border-b p-2">{user.role?.warehouse?.name}</td>
                                        <td className="border-b p-2">
                                            <span className="flex gap-2 justify-center items-center">
                                                <Link href={`/setting/user/edit/${user.id}`} className="bg-green-500 text-white py-2 px-6 rounded-lg">
                                                    <PencilIcon className="size-4" />
                                                </Link>
                                                <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white py-2 px-6 rounded-lg">
                                                    <Trash2Icon className="size-4" />
                                                </button>
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="px-4">{users?.links && <Paginator links={users} handleChangePage={handleChangePage} />}</div>
                </div>
            </div>
        </MainPage>
    );
};

export default User;
