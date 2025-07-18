"use client";
import Notification from "@/components/notification";
import Header from "../../Header";
import { useState, useEffect, useCallback } from "react";
import axios from "@/libs/axios";
import Modal from "@/components/Modal";
import CreateContact from "./CreateContact";
import { MapPin, MapPinIcon, PencilIcon, PhoneIcon, PlusCircleIcon, SearchIcon, TrashIcon } from "lucide-react";
import Paginator from "@/components/Paginator";

const Contact = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchContacts = useCallback(
        async (url = "/api/contacts") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setContacts(response.data.data);
            } catch (error) {
                setNotification("error", error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchContacts();
        }, 500);
        return () => clearTimeout(timeout);
    }, [fetchContacts]);
    const handleChangePage = (url) => {
        fetchContacts(url);
    };

    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateContactOpen(false);
    };

    return (
        <>
            <Header title="Contact" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        {notification.message && (
                            <Notification
                                type={notification.type}
                                notification={notification.message}
                                onClose={() => setNotification({ type: "", message: "" })}
                            />
                        )}
                        <div className="mb-2">
                            <button onClick={() => setIsModalCreateContactOpen(true)} className="bg-indigo-500 text-white py-2 px-6 rounded-lg">
                                Tambah Contact <PlusCircleIcon className="size-4 inline" />
                            </button>
                            <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Create Contact">
                                <CreateContact
                                    isModalOpen={setIsModalCreateContactOpen}
                                    notification={(message) => setNotification(message)}
                                    fetchContacts={fetchContacts}
                                />
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
                        <div className="overflow-x-auto bg-white rounded-2xl">
                            <table className="table w-full text-xs">
                                <thead>
                                    <tr>
                                        <th className="">Name</th>
                                        <th className="">Desctiption</th>
                                        <th className="">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts?.data?.map((contact) => (
                                        <tr key={contact.id}>
                                            <td className="">
                                                <span className="font-bold">{contact.name}</span>
                                                <span className="text-xs block mt-1">
                                                    <PhoneIcon className="size-4 inline" /> {contact.phone_number} <MapPinIcon className="size-4 inline" />{" "}
                                                    {contact.address}
                                                </span>
                                            </td>
                                            <td className="">
                                                {contact.type}: {contact.description}
                                            </td>
                                            <td className="">
                                                <span className="flex gap-2 justify-center items-center">
                                                    <button className="bg-green-500 text-white py-2 px-6 rounded-lg">
                                                        <PencilIcon className="size-4" />
                                                    </button>
                                                    <button className="bg-red-500 text-white py-2 px-6 rounded-lg">
                                                        <TrashIcon className="size-4" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-4">{contacts?.last_page > 1 && <Paginator links={contacts} handleChangePage={handleChangePage} />}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
