"use client";
import formatNumber from "@/libs/formatNumber";
import axios from "@/libs/axios";
import useSWR, { mutate } from "swr";
import { useState, useEffect } from "react";
import { BriefcaseIcon, FilterIcon, LoaderIcon, PercentCircleIcon, ReceiptTextIcon, RefreshCcwIcon, WalletCardsIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import { formatNumberToK } from "@/libs/formatNumberToK";
import Header from "../../Header";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import { useAuth } from "@/libs/auth";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const FinancialRatio = () => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouse = user?.role?.warehouse_id;
    const [filterData, setFilterData] = useState({
        startDate: getCurrentDate(),
        endDate: getCurrentDate(),
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const { dailyDashboard, loading: isLoading, error } = useGetDailyDashboard(selectedWarehouse, endDate);

    const handleFilterData = () => {
        setEndDate(filterData.endDate);
        setIsModalFilterDataOpen(false);
    };

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    useEffect(() => {
        mutate(`/api/daily-dashboard/${selectedWarehouse}/${endDate}`);
    }, [selectedWarehouse, endDate]);

    const netProfit = dailyDashboard?.data?.revenue - dailyDashboard?.data?.cost - dailyDashboard?.data?.expense;
    const netProfitPercentage = ((netProfit / dailyDashboard?.data?.revenue) * 100).toFixed(2);

    const cashBank = dailyDashboard?.data?.cash + dailyDashboard?.data?.bank;

    const rasioInput = {
        debtRatio: (dailyDashboard?.data?.liabilities / dailyDashboard?.data?.assets) * 100,
        currentRatio: dailyDashboard?.data?.currentAssets / dailyDashboard?.data?.liabilities,
        debtToEquity: (dailyDashboard?.data?.liabilities / (dailyDashboard?.data?.equity + netProfit)) * 100,
        roe: (dailyDashboard?.data?.netProfitCurrentMonth / (dailyDashboard?.data?.equity + netProfit)) * 100,
        quickRatio: (dailyDashboard?.data?.currentAssets - dailyDashboard?.data?.inventory) / dailyDashboard?.data?.liabilities,
        netProfitMargin: (netProfit / dailyDashboard?.data?.revenue) * 100,
        cashRatio: cashBank / dailyDashboard?.data?.liabilities,
    };

    const evaluate = (name, value) => {
        switch (name) {
            case "debtRatio":
                if (value > 60)
                    return "Tingkat utang perusahaan tinggi (>60%), mengindikasikan risiko finansial yang besar. Perusahaan sebaiknya mengurangi ketergantungan terhadap pembiayaan eksternal.";
                if (value >= 40) return "Struktur pendanaan cukup seimbang (40%–60%). Risiko masih dalam batas aman, namun perlu dipantau.";
                return "Tingkat utang rendah (<40%), menunjukkan struktur keuangan yang sehat dan stabil.";

            case "currentRatio":
                if (value < 1) return "Aset lancar tidak mencukupi untuk menutup kewajiban jangka pendek. Perusahaan berisiko kesulitan likuiditas.";
                if (value <= 2.5) return "Likuiditas perusahaan baik (1 – 2.5), aset lancar cukup untuk menutup kewajiban lancar.";
                return "Likuiditas sangat tinggi (>2,5), tetapi bisa jadi menandakan kelebihan aset tidak produktif.";

            case "debtToEquity":
                if (value > 150) return "Perusahaan terlalu mengandalkan utang (>150%), yang dapat memperbesar beban bunga dan risiko insolvensi.";
                if (value >= 50) return "Struktur pendanaan cukup seimbang antara utang dan modal sendiri (50–150%).";
                return "Pendanaan didominasi ekuitas (<50%), menunjukkan struktur modal yang konservatif dan minim risiko.";

            case "cashRatio":
                if (value < 1) return "Kas tidak mencukupi untuk menutup kewajiban jangka pendek. Perusahaan berisiko kesulitan likuiditas.";
                if (value <= 2) return "Kas cukup untuk menutup kewajiban lancar.";
                return "Kas sangat tinggi (>2), namun perlu dipastikan bahwa kas dimanfaatkan secara efisien.";

            case "roe":
                if (value < 10) return "Pengembalian terhadap modal pemilik rendah (<10%). Perlu evaluasi strategi efisiensi dan profitabilitas.";
                if (value <= 20) return "Pengembalian modal cukup sehat (10–20%). Menunjukkan efektivitas perusahaan dalam menggunakan modal.";
                return "Pengembalian modal sangat tinggi (>20%), mencerminkan profitabilitas dan efisiensi manajemen yang sangat baik.";

            case "quickRatio":
                if (value < 1)
                    return "Rendah, Perusahaan memiliki aset lancar yang tidak mencukupi untuk menutup kewajiban jangka pendek. Perusahaan berisiko kesulitan likuiditas.";
                if (value <= 2) return "Baik, Aset lancar cukup untuk menutup kewajiban lancar.";
                return "Likuiditas sangat tinggi (>2), namun perlu dipastikan bahwa aset likuid dimanfaatkan secara efisien.";

            case "netProfitMargin":
                if (value < 5) return "Margin laba rendah (<5%). Perusahaan mungkin menghadapi biaya operasional tinggi atau margin produk kecil.";
                if (value <= 15) return "Margin laba cukup sehat (5–15%). Menandakan efisiensi dalam pengelolaan biaya dan penjualan.";
                return "Margin laba tinggi (>15%). Perusahaan sangat efisien dan menguntungkan, strategi penjualan dan biaya berjalan optimal.";

            default:
                return "Rasio tidak dikenali.";
        }
    };

    return (
        <>
            <Header title="Financial Ratio Analysis" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-5 flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-blue-600">Financial Ratio Analysis</h1>
                                    <span className="block text-sm text-slate-400">Periode : {endDate}</span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => mutate(`/api/daily-dashboard/${selectedWarehouse}/${endDate}`)}
                                        className="bg-white mr-1 font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCcwIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
                                    </button>
                                    <button
                                        onClick={() => setIsModalFilterDataOpen(true)}
                                        className="bg-white font-bold p-3 rounded-lg border border-gray-300 hover:border-gray-400"
                                    >
                                        <FilterIcon className="size-4" />
                                    </button>
                                </div>
                                <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                                    <div className="mb-4">
                                        <Label className="font-bold">Tanggal</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                    </div>
                                </Modal>
                            </div>
                            <div className="overflow-x-auto">
                                <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Likuiditas</h1>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead>
                                        <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                            <th className="px-6 py-3">Rasio</th>
                                            <th>Hasil</th>
                                            <th>Ideal</th>
                                            <th>Analisis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4 whitespace-nowrap">Current Ratio</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.currentRatio.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">1.5 - 2.5</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("currentRatio", rasioInput.currentRatio)}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4">Quick Ratio</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.quickRatio.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">1 - 2</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("quickRatio", rasioInput.quickRatio)}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4">Cash Ratio</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.cashRatio.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">1 - 2</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("cashRatio", rasioInput.cashRatio)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="overflow-x-auto mt-5">
                                <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Solvabilitas</h1>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead>
                                        <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                            <th className="px-6 py-3">Rasio</th>
                                            <th>Hasil</th>
                                            <th>Ideal</th>
                                            <th>Analisis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4 whitespace-nowrap">Debt Ratio</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.debtRatio.toFixed(2)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">40% – 60%</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("debtRatio", rasioInput.debtRatio)}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4 whitespace-nowrap">Debt to Equity</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.debtToEquity.toFixed(2)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">50% – 150%</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("debtToEquity", rasioInput.debtToEquity)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="overflow-x-auto mt-5">
                                <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Profitabilitas</h1>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead>
                                        <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                            <th className="px-6 py-3">Rasio</th>
                                            <th>Hasil</th>
                                            <th>Ideal</th>
                                            <th>Analisis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4 whitespace-nowrap">Return to Equity</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.roe.toFixed(2)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">10% - 20%</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("roe", rasioInput.roe)}</td>
                                        </tr>
                                        <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                            <td className="px-6 py-4 whitespace-nowrap">Net Profit Margin</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.netProfitMargin.toFixed(2)}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap">5% – 15%</td>
                                            <td className="px-6 py-4 whitespace-normal">{evaluate("netProfitMargin", rasioInput.netProfitMargin)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default FinancialRatio;
