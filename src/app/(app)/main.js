"use client";
import {
    ArrowLeftRightIcon,
    ChartAreaIcon,
    CirclePowerIcon,
    DollarSignIcon,
    GemIcon,
    LayoutDashboardIcon,
    LoaderIcon,
    MenuIcon,
    StoreIcon,
    User2Icon,
    XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ResponsiveNavLink, { ResponsiveNavButton } from "@/components/ResponsiveNavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import formatNumber from "@/libs/formatNumber";
import { mutate } from "swr";

const MainPage = ({ children, headerTitle }) => {
    const { user } = useAuth({ middleware: "auth" });
    const [isOpen, setIsOpen] = useState(false);

    const pathName = usePathname();
    const drawerReff = useRef();
    const userRole = user?.role?.role;

    const userWarehouseId = user?.role?.warehouse_id;
    const userWarehouseName = user?.role?.warehouse?.name;
    const toOrdinal = (number) => {
        const suffixes = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
        const mod = number % 100;
        return suffixes[mod - 10] || suffixes[mod] || suffixes[0];
    };
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const longMonthName = today.toLocaleDateString("id-ID", { month: "long" });
        const day = String(today.getDate()).padStart(2, "0");
        const dayName = today.toLocaleDateString("id-ID", { weekday: "long" });
        return `${dayName}, ${day} ${longMonthName} ${year}`;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerReff.current && !drawerReff.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    return (
        <>
            <header className="w-full bg-blue-700 text-white h-20 flex items-center justify-between px-4 sm:px-12 py-2">
                <h1 className="text-xl sm:text-xl font-bold">
                    {headerTitle}
                    <span className="text-xs font-normal p-0 block">
                        {userWarehouseName}, {getCurrentDate()}
                    </span>
                </h1>
                <div className="flex items-center gap-2 border border-white px-4 py-1 rounded-2xl">
                    <User2Icon size={16} />
                    <h1>{user.email}</h1>
                </div>
            </header>
            <div
                ref={drawerReff}
                className={`mt-2 transform ${
                    isOpen ? "opacity-100 scale-y-100 h-auto" : "opacity-0 scale-y-0 h-0"
                } sm:hidden transition-all origin-top duration-200 ease-in`}
            >
                <div className="bg-white rounded-2xl">
                    <ul className="space-y-2 py-2">
                        <li className="flex items-center justify-between px-4 py-2">
                            <h1 className="text-md font-bold">{user?.role?.warehouse?.name}</h1>
                            <span className="text-sm">{user?.role?.role}</span>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/dashboard" active={pathName === "/dashboard"}>
                                <LayoutDashboardIcon size={20} className="mr-2 inline" /> Dashboard
                            </ResponsiveNavLink>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/transaction" active={pathName.startsWith("/transaction")}>
                                <ArrowLeftRightIcon size={20} className="mr-2 inline" /> Transaction
                            </ResponsiveNavLink>
                        </li>
                        <li className="">
                            <ResponsiveNavLink href="/store" active={pathName.startsWith("/store")}>
                                <StoreIcon size={20} className="mr-2 inline" /> Store
                            </ResponsiveNavLink>
                        </li>
                        {userRole === "Administrator" && (
                            <>
                                <li className="">
                                    <ResponsiveNavLink href="/finance" active={pathName.startsWith("/finance")}>
                                        <DollarSignIcon size={20} className="mr-2 inline" /> Finance
                                    </ResponsiveNavLink>
                                </li>
                                <li className="">
                                    <ResponsiveNavLink href="/summary" active={pathName.startsWith("/summary")}>
                                        <ChartAreaIcon size={20} className="mr-2 inline" /> Summary
                                    </ResponsiveNavLink>
                                </li>
                            </>
                        )}
                        <li className="border-t border-slate-300 pt-2">
                            <ResponsiveNavButton>
                                <CirclePowerIcon size={20} className="mr-2 inline" /> Logout
                            </ResponsiveNavButton>
                        </li>
                    </ul>
                </div>
            </div>
            <main className="h-[calc(100vh-80px)] overflow-auto">
                <div className="py-4 sm:py-8 px-4 sm:px-12 mb-28 sm:mb-0">{children}</div>
            </main>
        </>
    );
};

export default MainPage;
