"use client";
import Header from "@/app/(app)/Header";
import axios from "@/libs/axios";
import { use, useCallback, useEffect, useState } from "react";

const ProductHistory = ({ params }) => {
    const { id } = use(params);
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProduct = useCallback(async () => {
        try {
            const response = await axios.get(`/api/products/${id}`);
            setProduct(response.data.data);
            console.log(response);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return (
        <>
            <Header title="Product History" />
            <div className="py-8 relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">{product?.name}</h1>
                </div>
            </div>
        </>
    );
};

export default ProductHistory;
