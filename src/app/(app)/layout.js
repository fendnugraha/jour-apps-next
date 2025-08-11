"use client";
import { useAuth } from "@/libs/auth";
import Loading from "@/components/Loading";
import Navigation from "./Navigation";

const AppLayout = ({ children }) => {
    const { user, authLoading } = useAuth({ middleware: "auth" });
    if (authLoading || !user) {
        return <Loading />;
    }
    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation user={user} />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default AppLayout;
