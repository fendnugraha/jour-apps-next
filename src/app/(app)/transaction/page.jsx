"use client";
import Modal from "@/components/Modal";
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
import Loading from "../loading";
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    BuildingIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HandCoinsIcon,
    LayoutDashboardIcon,
    LoaderCircleIcon,
    RefreshCcwIcon,
    ShoppingBagIcon,
    VaultIcon,
    XIcon,
} from "lucide-react";
import useCashBankBalance from "@/libs/cashBankBalance";
import { mutate } from "swr";
import useGetWarehouses from "@/libs/getAllWarehouse";
import formatNumber from "@/libs/formatNumber";
import { Menu } from "@headlessui/react";
import CreateJournal from "./components/CreateJournal";
import CreateSalesByValue from "./components/CreateSalesByValue";
import Pagination from "@/components/PaginateList";
import CreatePrive from "./components/CreatePrive";
import CreateEquity from "./components/CreateEquity";
import CreateIncome from "./components/CreateIncome";
import { set } from "date-fns";

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

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const [journalsByWarehouse, setJournalsByWarehouse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [journalLoading, setJournalLoading] = useState(false);
    const [cashBank, setCashBank] = useState([]);
    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalCreateSalesByValueOpen, setIsModalCreateSalesByValueOpen] = useState(false);
    const [isModalCreateDepositOpen, setIsModalCreateDepositOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreateIncomeOpen, setIsModalCreateIncomeOpen] = useState(false);
    const [isModalCreatePriveOpen, setIsModalCreatePriveOpen] = useState(false);
    const [isModalCreateEquityOpen, setIsModalCreateEquityOpen] = useState(false);
    const [isExpenseMenuOpen, setIsExpenseMenuOpen] = useState(false);
    const [isJournalMenuOpen, setIsJournalMenuOpen] = useState(false);
    const [isModalCreateBankAdminFeeOpen, setIsModalCreateBankAdminFeeOpen] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [endDate, setEndDate] = useState(getCurrentDate());

    const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
    const [cashBankType, setCashBankType] = useState("");

    const menuRef = useRef(null);

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

    // Event listener untuk klik di luar menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsExpenseMenuOpen(false);
                setIsJournalMenuOpen(false);
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
        setIsModalCreateBankAdminFeeOpen(false);
        setIsModalCreateExpenseOpen(false);
        setIsModalCreateIncomeOpen(false);
        setIsModalCreatePriveOpen(false);
        setIsModalCreateEquityOpen(false);
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

    const filteredCashBankByWarehouse = cashBank.filter((cashBank) => cashBank.warehouse_id === warehouse || Number(cashBank.account_id) === 6);
    const filteredCashBankType = cashBankType === "" ? accountBalance?.data || [] : accountBalance?.data?.filter((ac) => ac.account_id === cashBankType) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of items per page

    // Calculate the total number of pages
    const totalItems = filteredCashBankType.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredCashBankType.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const summarizeBalance = accountBalance?.data?.reduce((total, account) => total + account.balance, 0);

    return (
        <>
            <Header title="Transaction" />
            <div className="py-8 relative">
                <div ref={menuRef} className="fixed sm:hidden bottom-0 w-full z-[999]">
                    <div className={`text-white shadow-xl ${!isJournalMenuOpen ? "hidden" : "flex flex-col justify-between items-center"}`}>
                        <button onClick={() => setIsModalCreateJournalOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Jurnal Umum
                        </button>
                        <button onClick={() => setIsModalCreateIncomeOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Kas Masuk (Income)
                        </button>
                        <button onClick={() => setIsModalCreateDepositOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Deposit Customer
                        </button>
                        <button
                            onClick={() => setIsModalCreateSalesByValueOpen(true)}
                            className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200"
                        >
                            Penjualan (By Value)
                        </button>
                        <button onClick={() => setIsModalCreateEquityOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Penambahan Modal (Equity)
                        </button>
                    </div>
                    <div className={`text-white ${!isExpenseMenuOpen ? "hidden" : "flex flex-col justify-between items-center"}`}>
                        <button onClick={() => setIsModalCreateExpenseOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Biaya Operasional
                        </button>
                        <button
                            onClick={() => setIsModalCreateBankAdminFeeOpen(true)}
                            className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200"
                        >
                            Biaya Admin Bank
                        </button>
                        <button onClick={() => setIsModalCreatePriveOpen(true)} className="bg-amber-500 w-full text-white p-4 border-t hover:bg-slate-200">
                            Penarikan Modal (prive)
                        </button>
                    </div>
                    <div className="text-white flex justify-between items-center">
                        <button
                            onClick={() => {
                                setIsJournalMenuOpen(!isJournalMenuOpen);
                                setIsExpenseMenuOpen(false);
                                setIsDailyReportOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <BuildingIcon className="w-7 h-7" /> Journal
                        </button>
                        <button
                            onClick={() => {
                                setIsExpenseMenuOpen(!isExpenseMenuOpen);
                                setIsJournalMenuOpen(false);
                                setIsDailyReportOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <HandCoinsIcon className="w-7 h-7" /> Biaya
                        </button>
                        <button
                            onClick={() => {
                                setIsDailyReportOpen(!isDailyReportOpen);
                                setIsJournalMenuOpen(false);
                                setIsExpenseMenuOpen(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 w-full flex flex-col items-center justify-center py-2 text-xs gap-1 focus:bg-amber-500"
                        >
                            <LayoutDashboardIcon className="w-7 h-7" /> Kas Bank
                        </button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6">
                    {notification.message && (
                        <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                    )}
                    <div className=" sm:rounded-lg">
                        <div className="mb-2 hidden sm:flex justify-start gap-2">
                            <button
                                className="bg-green-600 min-w-40 text-sm hover:bg-green-500 text-white hover:scale-105 transition-transform duration-200 ease-in py-2 px-6 rounded-lg group"
                                onClick={() => setIsModalCreateDepositOpen(true)}
                            >
                                Input Deposit
                            </button>
                            <Dropdown
                                trigger={
                                    <button className="bg-green-600 min-w-40 text-sm hover:bg-green-500 text-white hover:scale-105 transition-transform duration-200 ease-in py-2 px-6 rounded-lg group">
                                        Input Journal
                                        <ChevronRightIcon size={18} className="inline group-hover:rotate-90 transition-transform delay-300 duration-200" />
                                    </button>
                                }
                                align="left"
                            >
                                <Menu.Items className="min-w-max flex flex-col gap-y-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full min-w-40 text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
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
                                                onClick={() => setIsModalCreateIncomeOpen(true)}
                                            >
                                                Kas Masuk (income)
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
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateEquityOpen(true)}
                                            >
                                                Penambahan Modal (Equity)
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Dropdown>
                            <Dropdown
                                trigger={
                                    <button className="bg-red-600 text-sm hover:bg-red-500 text-white hover:scale-105 transition-transform duration-200 ease-in py-2 px-6 rounded-lg group">
                                        Biaya (Pengeluaran)
                                        <ChevronRightIcon size={18} className="inline group-hover:rotate-90 transition-transform delay-300 duration-200" />
                                    </button>
                                }
                                align="left"
                            >
                                <Menu.Items className="min-w-max flex flex-col gap-y-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateExpenseOpen(true)}
                                            >
                                                Biaya Operasional
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreateBankAdminFeeOpen(true)}
                                            >
                                                Biaya Administrasi Bank
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                className={`w-full text-sm text-left py-2 px-4 ${active ? "bg-slate-100" : ""}`}
                                                onClick={() => setIsModalCreatePriveOpen(true)}
                                            >
                                                Penarikan Modal (Prive)
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Dropdown>
                        </div>
                        <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Jurnal Umum">
                            <CreateJournal
                                today={today}
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
                                today={today}
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
                                today={today}
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
                                today={today}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Biaya Operasional">
                            <CreateExpense
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateExpenseOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                today={today}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateIncomeOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Pendapatan Lainnya">
                            <CreateIncome
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateIncomeOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                today={today}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreatePriveOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penarikan Modal (Prive)">
                            <CreatePrive
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreatePriveOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                                today={today}
                            />
                        </Modal>
                        <Modal isOpen={isModalCreateEquityOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Penambahan Modal (Equity)">
                            <CreateEquity
                                filteredCashBankByWarehouse={filteredCashBankByWarehouse}
                                isModalOpen={setIsModalCreateEquityOpen}
                                notification={(type, message) => setNotification({ type, message })}
                                fetchJournalsByWarehouse={fetchJournalsByWarehouse}
                                user={user}
                                today={today}
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
                                />
                            </div>
                            {/* <div className="order-1 sm:order-2 px-2 sm:px-0">
                                <CashBankBalance warehouse={warehouse} accountBalance={accountBalance} isValidating={isValidating} />
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            {/* Daily report */}
            <div
                className={`fixed top-[72px] right-0 h-full z-[100] shadow-lg w-full sm:w-[450px] ${
                    isDailyReportOpen ? "translate-x-0" : "translate-x-full"
                } transition-transform duration-300 ease-in-out bg-white`}
                ref={drawerRef}
            >
                <button
                    className={` ${
                        isDailyReportOpen ? "w-8 -left-8" : "-left-24 w-24"
                    } h-8 py-1 px-2 top-0 absolute bg-orange-300 shadow-lg text-xs hidden sm:flex items-center justify-start rounded-s-lg transition-all duration-300 delay-500 ease-in-out text-nowrap hover:bg-orange-200`}
                    onClick={() => setIsDailyReportOpen(!isDailyReportOpen)}
                >
                    <ChevronLeftIcon
                        size={20}
                        className={`inline ${isDailyReportOpen ? "rotate-180" : ""} transition-transform duration-300 delay-300 ease-in-out`}
                    />{" "}
                    {isDailyReportOpen ? "" : "Kas & Bank"}
                </button>
                <div className="px-4 py-2">
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-bold">Saldo Kas & Bank</h1>
                        <div className="flex gap-2">
                            <button
                                className="text-slate-400 hover:scale-110 transition-transform duration-75"
                                onClick={() => mutate(`/api/get-cash-bank-balance/${warehouse}/${endDate}`)}
                            >
                                <RefreshCcwIcon className={`w-5 h-5 ${isValidating ? "animate-spin" : ""}`} />
                            </button>
                            <button
                                className="text-slate-400 hover:scale-110 transition-transform duration-75 sm:hidden"
                                onClick={() => setIsDailyReportOpen(false)}
                            >
                                <XIcon className={`w-8 h-8`} />
                            </button>
                        </div>
                    </div>
                    <span className="block text-xs mb-4 text-slate-400">{getCurrentDate()}</span>

                    <div className="flex gap-2 mb-4 w-full bg-slate-300 p-0.5 text-xs rounded-3xl">
                        <button
                            className={`w-full ${
                                cashBankType === "" ? "bg-white" : "bg-slate-300 text-white"
                            } rounded-2xl p-1.5 cursor-pointer transition-colors duration-300 ease-out`}
                            onClick={() => setCashBankType("")}
                        >
                            Semua
                        </button>
                        <button
                            className={`w-full ${
                                cashBankType === 2 ? "bg-white" : "bg-slate-300 text-white"
                            } rounded-2xl p-1.5 cursor-pointer transition-colors duration-300 ease-out`}
                            onClick={() => setCashBankType(2)}
                        >
                            Bank
                        </button>
                        <button
                            className={`w-full ${
                                cashBankType === 1 ? "bg-white" : "bg-slate-300 text-white"
                            } rounded-2xl p-1.5 cursor-pointer transition-colors duration-300 ease-out`}
                            onClick={() => setCashBankType(1)}
                        >
                            Kas
                        </button>
                    </div>
                    <div className="max-h-full overflow-y-auto">
                        <table className="w-full">
                            <tbody>
                                {currentItems?.map((account) => (
                                    <tr className="text-sm border-b border-slate-300 border-dashed hover:bg-slate-200" key={account.id}>
                                        <td className="text-start text-xs py-2.5">{account.acc_name}</td>
                                        <td className="text-end font-bold text-slate-600">{formatNumber(account.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <Pagination
                                className={"w-full px-3 pb-3"}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                    <div>
                        <span className="text-xs text-slate-500">Total Saldo</span>
                        <h1 className="text-3xl font-bold">{formatNumber(summarizeBalance ?? 0)}</h1>
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
