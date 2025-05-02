"use client";
import axios from "@/libs/axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

export const useGetDailyDashboard = (warehouse, endDate) => {
    const {
        data: dailyDashboard,
        error,
        isValidating,
    } = useSWR(`/api/daily-dashboard/${warehouse}/${endDate}`, fetcher, {
        fallbackData: [],
        revalidateOnFocus: true,
        dedupingInterval: 60000,
    });

    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!dailyDashboard && !isValidating) return { loading: true };

    return { dailyDashboard, loading: isValidating, error };
};
