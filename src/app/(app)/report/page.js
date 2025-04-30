"use client";
import Notification from "@/components/notification";
import Header from "../Header";
import { useState } from "react";
import { useAuth } from "@/libs/auth";
import Link from "next/link";
import { ArrowRight, HandCoinsIcon, ReceiptCentIcon, ScaleIcon } from "lucide-react";

const Report = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [notification, setNotification] = useState("");
    const warehouse = user?.role?.warehouse_id;

    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Report"} />
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-10">
                    <div className="overflow-hidden sm:rounded-lg">
                        <div className="text-gray-900 dark:text-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">
                                <div className="group sm:relative bg-white p-3 sm:p-6 dark:bg-gray-800 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                                    <ScaleIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                                    <Link
                                        href="/report/balance-sheet"
                                        className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                                    >
                                        Neraca (Balance Sheet)
                                        <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                                    </Link>
                                </div>
                                <div className="group sm:relative bg-white p-3 sm:p-6 dark:bg-gray-800 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                                    <HandCoinsIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                                    <Link
                                        href="/report/profit-loss"
                                        className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                                    >
                                        Laba rugi (Profit Loss)
                                        <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                                    </Link>
                                </div>
                                <div className="group sm:relative bg-white p-3 sm:p-6 dark:bg-gray-800 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                                    <ReceiptCentIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                                    <Link
                                        href="/report/cashflow"
                                        className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                                    >
                                        Arus Kas (Cashflow)
                                        <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Report;
