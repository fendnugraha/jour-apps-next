"use client";
import Notification from "@/components/notification";
import Header from "../Header";
import { useState, useEffect } from "react";
import WarehouseBalance from "./components/WarehouseBalance";
import RevenueReport from "./components/RevenueReport";
import MutationHistory from "./components/MutationHistory";
import axios from "@/libs/axios";
import { useAuth } from "@/libs/auth";
import LogActivity from "./components/LogActivity";

const SummaryPage = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [account, setAccount] = useState(null);
    const [notification, setNotification] = useState("");
    const [errors, setErrors] = useState([]);

    const fetchAccount = async (url = "/api/get-all-accounts") => {
        try {
            const response = await axios.get(url);
            setAccount(response.data.data);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    useEffect(() => {
        fetchAccount();
    }, []);
    return (
        <>
            {notification && <Notification notification={notification} onClose={() => setNotification("")} />}
            <div className="">
                {/* <h1 className="text-2xl font-bold mb-4">Point of Sales - Add to Cart</h1> */}
                <Header title={"Summary Report"} />
                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <WarehouseBalance />
                        <RevenueReport />
                        <MutationHistory account={account} notification={(message) => setNotification(message)} user={user} />
                        <LogActivity />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SummaryPage;
