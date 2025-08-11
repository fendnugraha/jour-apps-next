"use client";
import { mutate } from "swr";
import { useState, useEffect } from "react";
import { FilterIcon, RefreshCcwIcon } from "lucide-react";
import Modal from "@/components/Modal";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Header from "../../Header";
import { useGetDailyDashboard } from "@/libs/getDailyDashboard";
import { useAuth } from "@/libs/auth";
import MainPage from "../../main";

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

    function evaluate(ratioType, value) {
        switch (ratioType) {
            case "currentRatio":
                if (value < 1)
                    return {
                        score: 3,
                        rating: "Kurang",
                        message:
                            "Current ratio di bawah 1 menunjukkan bahwa aset lancar perusahaan tidak cukup untuk menutup kewajiban jangka pendek. Ini menandakan potensi kesulitan likuiditas dan risiko gagal bayar dalam jangka pendek.",
                    };
                if (value <= 2.5)
                    return {
                        score: 7,
                        rating: "Baik",
                        message:
                            "Current ratio berada di kisaran ideal (1.5–2.5), artinya perusahaan memiliki aset lancar yang cukup untuk membayar semua kewajiban lancar. Kondisi ini mencerminkan kestabilan keuangan jangka pendek.",
                    };
                return {
                    score: 9,
                    rating: "Sangat Baik",
                    message:
                        "Current ratio melebihi 2.5, menandakan perusahaan sangat likuid. Namun, perlu diperhatikan bahwa likuiditas yang terlalu tinggi dapat berarti aset tidak dimanfaatkan secara optimal.",
                };

            case "quickRatio":
                if (value < 1)
                    return {
                        score: 3,
                        rating: "Kurang",
                        message:
                            "Quick ratio di bawah 1 menunjukkan bahwa aset lancar tanpa persediaan tidak cukup untuk menutup kewajiban jangka pendek. Perusahaan mungkin terlalu bergantung pada persediaan yang kurang likuid.",
                    };
                if (value <= 2)
                    return {
                        score: 7,
                        rating: "Baik",
                        message:
                            "Quick ratio menunjukkan likuiditas yang cukup tanpa mengandalkan persediaan. Ini mencerminkan manajemen modal kerja yang efisien dan kesehatan keuangan jangka pendek.",
                    };
                return {
                    score: 9,
                    rating: "Sangat Baik",
                    message:
                        "Quick ratio sangat tinggi, perusahaan sangat siap menghadapi kewajiban jangka pendek. Namun, pastikan dana tidak terlalu mengendap dan tetap produktif.",
                };

            case "cashRatio":
                if (value < 1)
                    return {
                        score: 2,
                        rating: "Kurang",
                        message:
                            "Cash ratio di bawah 0.5 menandakan bahwa kas dan setara kas tidak cukup untuk menutup setengah dari kewajiban jangka pendek. Ini berisiko menyebabkan masalah likuiditas apabila terjadi kebutuhan dana mendadak.",
                    };
                if (value <= 2)
                    return {
                        score: 6,
                        rating: "Cukup",
                        message:
                            "Cash ratio menunjukkan kas tersedia untuk menutup sebagian besar kewajiban lancar. Perusahaan memiliki kas yang cukup tetapi masih perlu berhati-hati.",
                    };
                return {
                    score: 9,
                    rating: "Sangat Baik",
                    message:
                        "Cash ratio melebihi 1, artinya kas perusahaan cukup untuk menutup seluruh kewajiban jangka pendek tanpa perlu likuidasi aset lainnya. Ini menunjukkan kesiapan likuiditas yang tinggi.",
                };

            case "debtRatio":
                if (value > 60)
                    return {
                        score: 3,
                        rating: "Tinggi",
                        message:
                            "Debt ratio di atas 60% menandakan bahwa sebagian besar aset perusahaan dibiayai dari utang. Struktur keuangan seperti ini berisiko tinggi, apalagi jika arus kas tidak stabil.",
                    };
                if (value >= 40)
                    return {
                        score: 6,
                        rating: "Cukup",
                        message:
                            "Debt ratio berada pada tingkat menengah (40–60%). Masih tergolong wajar, tetapi perlu pengawasan agar utang tidak terus meningkat tanpa didukung kinerja laba.",
                    };
                return {
                    score: 9,
                    rating: "Baik",
                    message: "Debt ratio di bawah 40% mencerminkan struktur keuangan yang sehat dan ketergantungan yang rendah terhadap utang.",
                };

            case "debtToEquity":
                if (value > 150)
                    return {
                        score: 3,
                        rating: "Tinggi",
                        message:
                            "Debt to equity ratio di atas 150% menunjukkan bahwa perusahaan dibiayai lebih banyak oleh utang daripada ekuitas. Ini meningkatkan risiko keuangan dan membatasi fleksibilitas pendanaan.",
                    };
                if (value >= 50)
                    return {
                        score: 6,
                        rating: "Cukup",
                        message:
                            "Debt to equity ratio antara 50%–150% mencerminkan struktur modal yang agresif. Risiko moderat, namun bisa diterima tergantung pada industri dan stabilitas arus kas.",
                    };
                return {
                    score: 9,
                    rating: "Baik",
                    message: "Debt to equity ratio di bawah 50% menandakan keseimbangan modal yang baik dan struktur keuangan yang stabil.",
                };

            case "roe":
                if (value < 5)
                    return {
                        score: 2,
                        rating: "Rendah",
                        message:
                            "Return on Equity (ROE) rendah, menunjukkan bahwa perusahaan belum mampu menghasilkan keuntungan yang signifikan dibanding modal yang ditanamkan pemilik.",
                    };
                if (value <= 15)
                    return {
                        score: 6,
                        rating: "Cukup",
                        message: "ROE menunjukkan tingkat keuntungan sedang. Perusahaan cukup efisien dalam menggunakan modal, namun masih bisa ditingkatkan.",
                    };
                return {
                    score: 9,
                    rating: "Baik",
                    message: "ROE tinggi menunjukkan efisiensi tinggi dalam penggunaan modal untuk menghasilkan laba. Ini tanda kinerja manajerial yang baik.",
                };

            case "netProfitMargin":
                if (value < 1)
                    return {
                        score: 2,
                        rating: "Rendah",
                        message:
                            "Net profit margin sangat kecil, menandakan bahwa hampir seluruh pendapatan habis untuk menutup biaya. Perusahaan perlu menekan biaya atau meningkatkan efisiensi penjualan.",
                    };
                if (value <= 5)
                    return {
                        score: 6,
                        rating: "Cukup",
                        message:
                            "Net profit margin tergolong sedang. Ada keuntungan yang dihasilkan, namun masih terdapat ruang besar untuk peningkatan profitabilitas.",
                    };
                return {
                    score: 9,
                    rating: "Baik",
                    message:
                        "Margin laba bersih tinggi, menandakan efisiensi biaya dan strategi penjualan yang baik. Perusahaan mampu mempertahankan sebagian besar pendapatannya sebagai laba.",
                };

            default:
                return {
                    score: 0,
                    rating: "Tidak Diketahui",
                    message: "Jenis rasio tidak dikenali atau belum tersedia evaluasinya.",
                };
        }
    }

    function calculateOverallRating() {
        const ratioKeys = Object.keys(rasioInput);
        let totalScore = 0;

        ratioKeys.forEach((key) => {
            const result = evaluate(key, rasioInput[key]);
            totalScore += result.score;
        });

        const averageScore = totalScore / ratioKeys.length;
        return Math.round(averageScore * 10) / 10;
    }

    function getFinalRating(score) {
        if (score < 4) return { rating: "Buruk", advice: "Kondisi keuangan tidak sehat. Perlu perbaikan signifikan." };
        if (score < 7) return { rating: "Cukup", advice: "Ada beberapa hal yang perlu ditingkatkan." };
        return { rating: "Baik", advice: "Kondisi keuangan cukup sehat dan terkendali." };
    }

    return (
        <MainPage headerTitle="Financial Ratio Analysis">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl">
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

                    <div className="mb-5">
                        <h1 className="text-sm text-slate-500">
                            Overall Rating (<span className="font-bold">{getFinalRating(calculateOverallRating()).rating}</span>){" "}
                        </h1>
                        <h1 className="text-5xl font-bold">
                            {calculateOverallRating()}
                            <span className="text-sm text-slate-500">/10</span>
                        </h1>
                    </div>
                    <div className="overflow-x-auto">
                        <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Likuiditas</h1>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead>
                                <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                    <th className="px-6 py-3 w-44">Rasio</th>
                                    <th className="w-32">Hasil</th>
                                    <th className="w-30">Ideal</th>
                                    <th>Analisis</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4 whitespace-nowrap">Current Ratio</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.currentRatio.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">1.5 - 2.5</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("currentRatio", rasioInput.currentRatio).message}</td>
                                </tr>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4">Quick Ratio</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.quickRatio.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">1 - 2</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("quickRatio", rasioInput.quickRatio).message}</td>
                                </tr>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4">Cash Ratio</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.cashRatio.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">1 - 2</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("cashRatio", rasioInput.cashRatio).message}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="overflow-x-auto mt-5">
                        <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Solvabilitas</h1>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead>
                                <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                    <th className="px-6 py-3 w-44">Rasio</th>
                                    <th className="w-32">Hasil</th>
                                    <th className="w-30">Ideal</th>
                                    <th>Analisis</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4 whitespace-nowrap">Debt Ratio</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.debtRatio.toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap">40% – 60%</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("debtRatio", rasioInput.debtRatio).message}</td>
                                </tr>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4 whitespace-nowrap">Debt to Equity</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.debtToEquity.toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap">50% – 150%</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("debtToEquity", rasioInput.debtToEquity).message}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="overflow-x-auto mt-5">
                        <h1 className="text-xl font-bold text-slate-600 mb-5">Rasio Profitabilitas</h1>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead>
                                <tr className="text-sm text-gray-700 uppercase bg-gray-50">
                                    <th className="px-6 py-3 w-44">Rasio</th>
                                    <th className="w-32">Hasil</th>
                                    <th className="w-30">Ideal</th>
                                    <th>Analisis</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4 whitespace-nowrap">Return to Equity</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.roe.toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap">5% - 15%</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("roe", rasioInput.roe).message}</td>
                                </tr>
                                <tr className="border-b border-slate-300 border-dashed text-slate-500">
                                    <td className="px-6 py-4 whitespace-nowrap">Net Profit Margin</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{isLoading ? "..." : rasioInput.netProfitMargin.toFixed(2)}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap">1% – 5%</td>
                                    <td className="px-6 py-4 whitespace-normal">{evaluate("netProfitMargin", rasioInput.netProfitMargin).message}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </MainPage>
    );
};
export default FinancialRatio;
