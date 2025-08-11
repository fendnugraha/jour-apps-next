import Link from "next/link";
import { ArrowRight, ChartCandlestickIcon, HandCoinsIcon, ReceiptCentIcon, ScaleIcon } from "lucide-react";
import MainPage from "../main";

const Report = () => {
    return (
        <MainPage headerTitle="Report">
            <div className="overflow-hidden sm:rounded-lg">
                <div className="text-gray-900">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">
                        <div className="group sm:relative bg-white p-3 sm:p-6 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                            <ScaleIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                            <Link
                                href="/report/balance-sheet"
                                className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                            >
                                Neraca (Balance Sheet)
                                <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                            </Link>
                        </div>
                        <div className="group sm:relative bg-white p-3 sm:p-6 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                            <HandCoinsIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                            <Link
                                href="/report/profit-loss"
                                className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                            >
                                Laba rugi (Profit Loss)
                                <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                            </Link>
                        </div>
                        <div className="group sm:relative bg-white p-3 sm:p-6 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                            <ReceiptCentIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                            <Link
                                href="/report/cashflow"
                                className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                            >
                                Arus Kas (Cashflow)
                                <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                            </Link>
                        </div>
                        <div className="group sm:relative bg-white p-3 sm:p-6 overflow-hidden shadow-md rounded-xl h-32 sm:h-60 flex sm:justify-center justify-evenly items-center flex-col gap-1">
                            <ChartCandlestickIcon className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 transition-transform duration-300" />
                            <Link
                                href="/report/financial-ratio"
                                className="sm:sm:absolute hover:underline group-hover:font-bold bottom-4 right-5 text-sm rounded-full transition-all duration-300"
                            >
                                Rasio Keuangan
                                <ArrowRight className="w-4 h-4 inline ml-2 group-hover:scale-125 transition-transform duration-300 " />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainPage>
    );
};

export default Report;
