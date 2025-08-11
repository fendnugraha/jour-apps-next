"use client";
import { useAuth } from "@/libs/auth";
import Payable from "./components/Payable";
import MainPage from "../main";

const Finance = () => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouse = user?.role?.warehouse_id;

    return (
        <MainPage headerTitle="Finance">
            <Payable notification={(type, message) => setNotification({ type, message })} />
        </MainPage>
    );
};

export default Finance;
