"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import axios from "@/libs/axios";

export default function AgreementPage({ agreementText, onSuccess, notification, fetchLicense }) {
    const agreementRef = useRef(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isScrolledBottom, setIsScrolledBottom] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleScroll = () => {
        const el = agreementRef.current;
        if (!el) return;

        const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

        if (isBottom) setIsScrolledBottom(true);
    };

    const handleSubmit = async () => {
        if (!isChecked || !isScrolledBottom) return;

        setLoading(true);
        try {
            await axios.post("/api/license/accept-agreement", {
                agreement_snapshot: agreementText,
            });

            onSuccess?.();
            notification({ type: "success", message: "Persetujuan berhasil disimpan" });
            fetchLicense();
        } catch (err) {
            alert("Gagal menyimpan persetujuan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* <h1 className="text-2xl font-bold mb-4 text-center">Perjanjian Lisensi Aplikasi</h1> */}

            {/* Agreement Box */}
            <div
                ref={agreementRef}
                onScroll={handleScroll}
                className="rounded-lg p-4 h-80 overflow-y-auto bg-slate-200 dark:bg-slate-900 text-xs leading-relaxed"
            >
                <pre className="whitespace-pre-wrap font-sans">{agreementText}</pre>
            </div>

            {!isScrolledBottom && <p className="text-xs text-red-500 mt-2">Harap scroll sampai bagian bawah untuk melanjutkan</p>}

            {/* Checkbox */}
            <div className="flex items-center gap-2 mt-4">
                <input
                    type="checkbox"
                    id="agree"
                    disabled={!isScrolledBottom}
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="agree" className="text-sm">
                    Saya telah membaca dan menyetujui seluruh isi perjanjian
                </label>
            </div>

            {/* Submit */}
            <button
                buttonType="info"
                className="w-full mt-6 p-4 bg-slate-700 text-white text-sm hover:bg-slate-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                disabled={!isChecked || !isScrolledBottom || loading}
                onClick={handleSubmit}
            >
                {loading ? "Menyimpan..." : "Setujui & Lanjutkan"}
            </button>
        </div>
    );
}
