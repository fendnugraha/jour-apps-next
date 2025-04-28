"use client";
import Modal from "@/components/Modal";
import CreateTransfer from "./components/CreateTransfer";
import Header from "../Header";
import { useState, useEffect, useRef } from "react";
import axios from "@/libs/axios";
import Notification from "@/components/notification";
import { useAuth } from "@/libs/auth";
import JournalTable from "./components/JournalTable";
import Dropdown from "@/components/Dropdown";
import CreateDeposit from "./components/CreateDeposit";
import CreateBankAdminFee from "./components/CreateBankAdminFee";
import CreateExpense from "./components/CreateExpense";
import CashBankBalance from "./components/CashBankBalance";
import Loading from "../loading";
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HandCoinsIcon,
    LayoutDashboardIcon,
    LoaderCircleIcon,
    RefreshCcwIcon,
    ShoppingBagIcon,
} from "lucide-react";
import useCashBankBalance from "@/libs/cashBankBalance";
import { mutate } from "swr";
import useGetWarehouses from "@/libs/getAllWarehouse";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { Menu } from "@headlessui/react";
import CreateJournal from "./components/CreateJournal";
import CreateSalesByValue from "./components/CreateSalesByValue";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const TransactionPage = () => {
    const { user } = useAuth({ middleware: "auth" });
    if (!user) {
        return <Loading />;
    }
    const warehouse = user.role?.warehouse_id;

    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [journalLoading, setJournalLoading] = useState(false);
    const [cashBank, setCashBank] = useState([]);
    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalCreateSalesByValueOpen, setIsModalCreateSalesByValueOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [startDate, setStartDate] = useState(getCurrentDate());
    const [endDate, setEndDate] = useState(getCurrentDate());

    const [isVoucherMenuOpen, setIsVoucherMenuOpen] = useState(false);
    const [isExpenseMenuOpen, setIsExpenseMenuOpen] = useState(false);
    const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
    const initCashValue = localStorage.getItem("openingCash") || 0;
    const [openingCash, setOpeningCash] = useState(initCashValue);

    const menuRef = useRef(null);
    const { dailyDashboard, loading: isLoading, error: dailyDashboardError } = useGetDailyDashboard(warehouse, getCurrentDate(), getCurrentDate());

    const drawerRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setIsDailyReportOpen(false);
            }
        }

        if (isDailyReportOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDailyReportOpen]);

    const totalSetoran =
        dailyDashboard?.data?.totalFee +
        dailyDashboard?.data?.totalCash +
        dailyDashboard?.data?.totalCashDeposit +
        dailyDashboard?.data?.totalAccessories +
        dailyDashboard?.data?.totalVoucher +
        dailyDashboard?.data?.totalExpense;

    // Event listener untuk klik di luar menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsVoucherMenuOpen(false); // Tutup menu jika klik di luar
                setIsExpenseMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const closeModal = () => {
        setIsModalCreateJournalOpen(false);
        setIsModalCreateSalesByValueOpen(false);
        setIsModalCreateDepositOpen(false);
        setIsModalCreateVoucherOpen(false);
        setIsModalCreateMutationToHqOpen(false);
        setIsModalCreateBankAdminFeeOpen(false);
        setIsModalCreateExpenseOpen(false);
    };
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouse);
    const { accountBalance, error: accountBalanceError, loading: isValidating } = useCashBankBalance(selectedWarehouseId, endDate);

    const { warehouses, warehousesError } = useGetWarehouses();
    const fetchJournalsByWarehouse = async (selectedWarehouse = warehouse, startDate = getCurrentDate(), endDate = getCurrentDate()) => {
        setJournalLoading(true);
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${selectedWarehouse}/${startDate}/${endDate}`);
            setJournalsByWarehouse(response.data);
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setJournalLoading(false);
        }
    };

    useEffect(() => {
        fetchJournalsByWarehouse();
    }, []); // Include startDate and endDate in the dependency array

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${selectedWarehouseId}/${endDate}`);
    }, [journalsByWarehouse]);

    const fetchCashBank = async () => {
        try {
            const response = await axios.get(`/api/get-cash-and-bank`);
            setCashBank(response.data.data); // Commented out as it's not used
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchCashBank();
    }, []);

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => cashBank.warehouse_id === warehouse);
    const hqCashBank = cashBank.filter((cashBank) => cashBank.warehouse_id === 1);
    return (
        <>
            <Header title="Transaction" />
            <div className="py-8 relative">
                <div ref={menuRef} className="fixed sm:hidden bottom-0 w-full z-[999]">
                    <div className={`text-white shadow-xl ${!isVoucherMenuOpen ? "hidden" : "flex flex-col justify-between items-center"}`}>
                        <button onClick={() => setIsModalCreateVoucherOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Penjualan Voucher
                        </button>
                        <button onClick={() => setIsModalCreateDepositOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Input Deposit
                        </button>
                    </div>
                    <div className={`text-white ${!isExpenseMenuOpen ? "hidden" : "flex flex-col justify-between items-center"}`}>
                        <button
                            onClick={() => setIsModalCreateMutationToHqOpen(true)}
                            className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200"
                        >
                            Pengembailan Saldo
                        </button>
                        <button onClick={() => setIsModalCreateExpenseOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Biaya Operasional
                        </button>
                        <button
                            onClick={() => setIsModalCreateBankAdminFeeOpen(true)}
                            className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200"
                        >
                            Biaya Admin Bank
                        </button>
                    </div>
                    <div className="text-white flex justify-between items-center">
                        <button
                            onClick={() => {
                                setIsModalCreateJournalOpen(true);
                                setIsExpenseMenuOpen(false);
                                setIsVoucherMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1"
                        >
                            <ArrowUpCircleIcon className="w-7 h-7" /> Transfer
                        </button>
                        <button
                            onClick={() => {
                                setIsModalCreateSalesByValueOpen(true);
                                setIsExpenseMenuOpen(false);
                                setIsVoucherMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1"
                        >
                            <ArrowDownCircleIcon className="w-7 h-7" /> Tarik Tunai
                        </button>
                        <button
                            onClick={() => {
                                setIsVoucherMenuOpen(!isVoucherMenuOpen);
                                setIsExpenseMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <ShoppingBagIcon className="w-7 h-7" /> Voucher
                        </button>
                        <button
                            onClick={() => {
                                setIsExpenseMenuOpen(!isExpenseMenuOpen);
                                setIsVoucherMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <HandCoinsIcon className="w-7 h-7" /> Biaya
                        </button>
                        <button
                            onClick={() => {
                                setIsDailyReportOpen(!isDailyReportOpen);
                                setIsVoucherMenuOpen(false);
                                setIsExpenseMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <LayoutDashboardIcon className="w-7 h-7" /> Report
                        </button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6">
                    {notification.message && (
                        <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                    )}
                    <div className="overflow-hidden sm:rounded-lg">
                        <div className="mb-2 hidden sm:flex justify-start gap-2">
                            <Dropdown
                                trigger={
                                    <button className="bg-green-600 text-sm hover:bg-green-500 text-white py-2 px-6 rounded-lg group">
                                        Input Journal
                                        <ChevronRightIcon size={18} className="inline group-hover:rotate-90 transition-transform delay-300 duration-200" />
                                    </button>
                                }
                                align="right"
                            >
                                <Menu.Items className="min-w-max flex flex-col gap-y-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateJournalOpen(true)}
                                            >
                                                Journal Umum
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateDepositOpen(true)}
                                            >
                                                Deposit
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateSalesByValueOpen(true)}
                                            >
                                                Penjualan (Value)
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Dropdown>
                        </div>
                        <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Jurnal Umum">
                            <CreateJournal
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateJournalOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                            />
                        </Modal>

                        <Modal isOpen={isModalCreateSalesByValueOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Barang & Jasa (Value)">
                            <CreateSalesByValue
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateSalesByValueOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateDepositOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penjualan Deposit">
                            <CreateDeposit
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateSalesByValueOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                            />
                        </Modal>
                        {/* Expenses */}
                        <Modal isOpen={isModalCreateBankAdminFeeOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Administrasi Bank">
                            <CreateBankAdminFee
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateBankAdminFeeOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Operasional">
                            <CreateExpense
                                isModalOpen={setIsModalCreateExpenseOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                            />
                        </Modal>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-20 sm:mb-0">
                            <div className="relative col-span-1 sm:col-span-3 bg-white py-6 rounded-2xl order-2 sm:order-1">
                                {journalLoading && <LoaderCircleIcon size={20} className="absolute top-1 left-1 animate-spin text-slate-300" />}
                                <JournalTable
                                    cashBank={cashBank}
                                    notification={(type, message) => setNotification({ type, message })}
                                    fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                    journalsByWarehouse={journalsByWarehouse}
                                    warehouses={warehouses}
                                    warehouse={warehouse}
                                    warehouseId={(warehouseId) => setSelectedWarehouseId(warehouseId)}
                                    user={user}
                                    loading={journalLoading}
                                    hqCashBank={hqCashBank}
                                />
                            </div>
                            <div className="order-1 sm:order-2 px-2 sm:px-0">
                                <CashBankBalance warehouse={warehouse} accountBalance={accountBalance} isValidating={isValidating} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Daily report */}
            <div
                className={`fixed top-[72px] right-0 h-full z-[100] shadow-lg w-full sm:w-1/4 ${
                    isDailyReportOpen ? "translate-x-0" : "translate-x-full"
                } transition-transform duration-300 ease-in-out bg-white`}
                ref={drawerRef}
            >
                <button
                    className={` ${
                        isDailyReportOpen ? "w-8 -left-8" : "-left-8 w-8"
                    } h-8 py-1 px-2 top-0 absolute bg-orange-300 shadow-lg text-xs hidden sm:flex items-center justify-start rounded-s-lg transition-all duration-300 ease-in-out text-nowrap hover:bg-orange-200`}
                    onClick={() => setIsDailyReportOpen(!isDailyReportOpen)}
                >
                    <ChevronLeftIcon
                        size={20}
                        className={`inline ${isDailyReportOpen ? "rotate-180" : ""} transition-transform duration-300 delay-300 ease-in-out`}
                    />{" "}
                    {/* {isDailyReportOpen ? "" : "Daily Report"} */}
                </button>
                <div className="px-4 py-2">
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-bold">Daily Report</h1>
                        <button
                            className="text-slate-400 hover:scale-110 transition-transform duration-75"
                            onClick={() => mutate(`/api/daily-dashboard/${warehouse}/${startDate}/${endDate}`)}
                        >
                            <RefreshCcwIcon className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                    <span className="block text-xs mb-4 text-slate-400">{getCurrentDate()}</span>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Uang Tunai</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalCash)}</h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Voucher</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalVoucher)}</h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Accessories</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalAccessories)}</h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Deposit</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalCashDeposit)}</h1>
                    </div>
                    <hr className="border border-dashed" />
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold text-slate-700">Pendapatan</h1>
                        <h1 className="text-xs font-bold text-end text-green-500">
                            {formatNumber(
                                dailyDashboard?.data?.totalCash +
                                    dailyDashboard?.data?.totalCashDeposit +
                                    dailyDashboard?.data?.totalAccessories +
                                    dailyDashboard?.data?.totalVoucher
                            )}
                        </h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Fee Admin</h1>
                        <h1 className="text-xs font-bold text-end">{formatNumber(dailyDashboard?.data?.totalFee ?? 0)}</h1>
                    </div>
                    <div className="flex justify-between mb-1">
                        <h1 className="text-xs text-slate-600">Biaya</h1>
                        <h1 className="text-xs font-bold text-red-500 text-end">{formatNumber(dailyDashboard?.data?.totalExpense ?? 0)}</h1>
                    </div>
                    <hr className="border border-dashed" />
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold text-slate-700">Profit (Laba)</h1>
                        <h1 className="text-xs font-bold text-end text-green-500">{formatNumber(dailyDashboard?.data?.profit)}</h1>
                    </div>
                    <div className="flex justify-between mt-1 mb-4">
                        <h1 className="text-xs font-bold text-slate-700">Total Pendapatan</h1>
                        <h1 className="text-xs font-bold text-end text-green-500">
                            {formatNumber(
                                dailyDashboard?.data?.totalFee +
                                    dailyDashboard?.data?.totalCash +
                                    dailyDashboard?.data?.totalCashDeposit +
                                    dailyDashboard?.data?.totalAccessories +
                                    dailyDashboard?.data?.totalVoucher +
                                    dailyDashboard?.data?.totalExpense
                            )}
                        </h1>
                    </div>
                    <div className="mb-4">
                        <Label>Set Uang Awal</Label>
                        <Input
                            type="number"
                            className={"w-full text-end text-sm"}
                            value={openingCash}
                            onChange={(e) => {
                                const value = e.target.value;
                                setOpeningCash(value);
                                localStorage.setItem("openingCash", value);
                            }}
                            placeholder="Contoh: 9.000.000"
                        />
                    </div>

                    <div className="mb-4 p-2 border rounded-xl">
                        <h1 className="text-xs font-bold text-slate-700">Total Uang Disetor</h1>
                        <h1 className="text-xs text-end text-red-400">{formatNumber(openingCash > 0 ? -openingCash : 0)}</h1>
                        <h1 className="text-lg font-bold text-end text-green-500">{formatNumber(totalSetoran - openingCash)}</h1>
                    </div>

                    <button type="button" className="w-full sm:hidden bg-blue-500 text-white py-2 px-4 rounded-md" onClick={() => setIsDailyReportOpen(false)}>
                        Tutup
                    </button>
                </div>
            </div>
        </>
    );
};

export default TransactionPage;
