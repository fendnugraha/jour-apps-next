"use client";
import Header from "@/app/(app)/Header";
import Notification from "@/components/notification";
import axios from "@/libs/axios";
import { useAuth } from "@/libs/auth";
import Payable from "./components/Payable";
import { useEffect, useState } from "react";

const Finance = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const warehouse = user?.role?.warehouse_id;

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Finance"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <Payable notification={(type, message) => setNotification({ type, message })} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Finance;
