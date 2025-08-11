"use client";
import { useState, useEffect } from "react";
import MutationHistory from "./components/MutationHistory";
import axios from "@/libs/axios";
import { useAuth } from "@/libs/auth";
import LogActivity from "./components/LogActivity";
import DailyProfit from "./components/DailyProfit";
import MainPage from "../main";

const SummaryPage = () => {
    const { user } = useAuth({ middleware: "auth" });

    const [account, setAccount] = useState(null);
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
        <MainPage headerTitle="Summary Report">
            <DailyProfit />
            <MutationHistory account={account} user={user} />
            {/* <LogActivity /> */}
        </MainPage>
    );
};

export default SummaryPage;
