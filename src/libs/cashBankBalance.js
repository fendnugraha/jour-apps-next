"use client";
import axios from "@/libs/axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useCashBankBalance = (selectedWarehouseId, endDate) => {
    const {
        data: accountBalance,
        error,
        isValidating,
    } = useSWR(selectedWarehouseId ? `/api/get-cash-bank-balance/${selectedWarehouseId}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    // Handle loading, errors, and data
    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!accountBalance && !isValidating) return { loading: true };

    return { accountBalance, loading: isValidating, error: error?.response?.data?.errors };
};

export default useCashBankBalance;
// src/libs/cashBankBalance.js
