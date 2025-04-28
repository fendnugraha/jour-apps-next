"use client";
import formatNumber from "@/libs/formatNumber";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { useState } from "react";

const CashBankBalance = ({ accountBalance, isValidating }) => {
    const summarizeBalance = accountBalance?.data?.reduce((total, account) => total + account.balance, 0);
    const [showBalances, setShowBalances] = useState(true);
    return (
        <div className="relative">
            {isValidating && (
                <div className="absolute top-0 left-2">
                    <LoaderCircle className="w-4 h-4 inline text-white animate-spin" />
                </div>
            )}
            <div className="flex justify-center items-center flex-col bg-gray-600 hover:bg-gray-500 py-4 rounded-t-2xl text-white shadow-lg">
                {accountBalance?.data?.length > 0 ? (
                    <>
                        <h1 className="text-xs">Total Saldo Kas & Bank</h1>
                        <h1 className="text-2xl text-yellow-200 font-black">{formatNumber(summarizeBalance ?? 0)}</h1>
                    </>
                ) : (
                    <span className="font-normal text-sm">Loading...</span>
                )}
            </div>

            <div
                className={`bg-gray-500 px-2 transform ${
                    showBalances ? "opacity-100 scale-y-100 max-h-[700px]" : "opacity-0 scale-y-0 max-h-0 "
                } origin-top transition-all duration-300 ease-in-out`}
            >
                {accountBalance?.data?.map((account) => (
                    <div className="group border-b border-dashed last:border-none p-2" key={account.id}>
                        <div className="flex flex-col justify-between text-white">
                            <h1 className="text-xs">{account.acc_name}</h1>

                            <h1 className="text-sm sm:text-lg group-hover:scale-105 text-yellow-200 font-bold text-end transition delay-100 duration-150 ease-out">
                                {formatNumber(account.balance)}
                            </h1>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={() => setShowBalances(!showBalances)}
                className="bg-gray-400 hover:bg-gray-500 w-full pb-1 rounded-b-2xl shadow-md text-white disabled:bg-gray-100"
                disabled={accountBalance?.data?.length === 0}
            >
                <ChevronDown className={`w-4 h-4 inline ${showBalances ? "rotate-180" : ""} transition delay-500 ease-in-out`} />
            </button>
        </div>
    );
};

export default CashBankBalance;
