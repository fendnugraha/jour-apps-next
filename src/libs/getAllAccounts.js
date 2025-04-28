import useSWR from "swr";
import axios from "@/libs/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

export const useGetAllAccounts = () => {
    const {
        data: accounts,
        error: accountsError,
        isValidating,
    } = useSWR("/api/get-all-accounts", fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    return { accounts, accountsError, isValidating };
};

export default useGetAllAccounts;
