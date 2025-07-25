"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth";
import Image from "next/image";
import Loading from "./loading";
import { SatelliteDishIcon } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { login, error: authError } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/transaction",
    });

    useEffect(() => {
        if (authError) {
            const status = authError?.code === "ERR_NETWORK" ? "Network Error, trying to reach the server" : authError?.message;
            setStatus(status);
        }
    }, [authError]);

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset));
        } else {
            setStatus(null);
        }
    }, [router.reset, errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password, setErrors, setStatus, setMessage, setLoading });
    };

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full sm:w-[400px] md:1/3">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {authError?.code !== "ERR_NETWORK" ? (
                        <>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || message === "Login successful!" || authError?.code === "ERR_NETWORK"}
                                className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed `}
                            >
                                {loading || message === "Login successful!"
                                    ? "Loging in ..."
                                    : authError?.code === "ERR_NETWORK"
                                    ? "Retrying connection.."
                                    : "Login"}
                            </button>
                        </>
                    ) : (
                        <div className="mb-4 flex flex-col gap-2 justify-center items-center animate-pulse">
                            <SatelliteDishIcon size={150} strokeWidth={2} className=" text-red-500 mx-auto" />
                            <span className="text-slate-500 text-xs">Retrying connection, please wait..</span>
                        </div>
                    )}
                </form>
                <p className="text-center mt-6 text-xs">
                    &copy; 2022 Jour Apps by <Image src="/eightnite.png" alt="Logo" width={60} height={60} className="inline-block mx-1 w-auto" /> All rights
                    reserved
                </p>
            </div>
            <span className="italics font-bold fixed bottom-5 right-8">{status && <p className="text-red-500 text-xs">Network Status: {status}!</p>}</span>
            {/* <div className="italics font-bold fixed bottom-5 right-8">{message && <p className="text-green-500 text-xs">{message}</p>}</div> */}
            {message && <Loading />}
        </>
    );
};

export default LoginPage;
