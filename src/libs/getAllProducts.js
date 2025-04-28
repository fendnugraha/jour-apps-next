import useSWR from "swr";
import axios from "@/libs/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useGetProducts = () => {
    const {
        data: products,
        error: productsError,
        isValidating,
    } = useSWR("/api/get-all-products", fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    return { products, productsError, isValidating };
};

export default useGetProducts;
