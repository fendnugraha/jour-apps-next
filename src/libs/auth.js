"use client";
import useSWR from "swr";
import axios from "./axios";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const params = useParams();

    const {
        data: user,
        error,
        mutate,
    } = useSWR("/api/user", () =>
        axios
            .get("/api/user")
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            })
    );

    const csrf = () => axios.get("/sanctum/csrf-cookie");

    const login = async ({ setErrors, setStatus, setMessage, setLoading, ...props }) => {
        setLoading(true); // Set loading state to true before login starts
        await csrf();

        setErrors([]);
        setStatus(null);

        axios
            .post("/login", props)
            .then(() => {
                mutate();
                setMessage("Login successful!");
                setLoading(false); // Set loading state to false once login is successful

                // Add your routing logic here, for example:
                // history.push("/dashboard"); // if using react-router
            })
            .catch((error) => {
                setLoading(false); // Set loading state to false if an error occurs
                if (error.response.status !== 422) throw error;
                setStatus(error.response.status);
                setErrors(error.response.data.errors);
            });
    };

    const logout = async () => {
        if (!error) {
            await axios.post("/logout").then(() => mutate());
        }

        window.location.href = "/";
    };

    useEffect(() => {
        if (middleware === "guest" && redirectIfAuthenticated && user) router.push(redirectIfAuthenticated);

        if (middleware === "auth" && !user) router.push("/");

        if (window.location.pathname === "/" && user) router.push(redirectIfAuthenticated || "/transaction");
        if (middleware === "auth" && error) logout();
    });

    return {
        user,
        error,
        login,
        logout,
    };
};
