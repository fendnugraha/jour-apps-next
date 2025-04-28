import useSWR from "swr";
import axios from "@/libs/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

export const useGetRevenueReport = (startDate, endDate) => {
    const {
        data: revenueReport,
        error: revenueReportError,
        isValidating,
    } = useSWR(`/api/get-revenue-report/${startDate}/${endDate}`, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    return { revenueReport, revenueReportError, isValidating };
};

export default useGetRevenueReport;
