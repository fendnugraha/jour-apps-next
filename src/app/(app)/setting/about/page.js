"use client";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import AgreementPage from "./AgreementPage";
import axios from "@/libs/axios";
import Notification from "@/components/notification";
import { formatDate, formatDateTime } from "@/libs/format";

const AboutPage = () => {
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;
    const agreementText = `PERJANJIAN LISENSI & PENGGUNAAN APLIKASI

JOUR ACCOUNTING

Perjanjian ini dibuat dan disepakati oleh dan antara:

Developer
Eightnite Studio

Klien
GEMILANG SUKSES MUAMALAH

Secara bersama-sama disebut sebagai “Para Pihak”.

PASAL 1
RUANG LINGKUP PERJANJIAN

Developer menyediakan aplikasi Jour Accounting, yaitu aplikasi akuntansi berbasis sistem custom untuk kebutuhan internal Klien.

Aplikasi bersifat custom dan eksklusif, dibuat khusus untuk Klien dan tidak diperjualbelikan secara umum.

Lisensi yang diberikan bersifat non-transferable dan hanya berlaku untuk Klien.

PASAL 2
BIAYA & MASA KONTRAK

Biaya lisensi aplikasi ditetapkan sebesar Rp250.000 (dua ratus lima puluh ribu rupiah) per bulan.

Perjanjian ini memiliki masa kontrak minimal 12 (dua belas) bulan sejak tanggal persetujuan.

Total nilai kontrak minimal adalah Rp3.000.000 (tiga juta rupiah).

Biaya lisensi ini hanya mencakup fitur yang telah tersedia pada aplikasi saat perjanjian disepakati.

PASAL 3
PEMBAYARAN

Pembayaran dilakukan setiap bulan dan paling lambat pada tanggal 5.

Apabila pembayaran tidak dilakukan sampai batas waktu tersebut, maka status lisensi akan berubah menjadi Nonaktif (Expired).

Akses aplikasi dapat dibatasi atau dinonaktifkan apabila lisensi berstatus Expired.

PASAL 4
FITUR TAMBAHAN

Permintaan penambahan fitur di luar fitur yang telah tersedia akan dikenakan biaya tambahan.

Biaya pengembangan fitur tambahan akan dibahas dan disepakati secara terpisah.

Developer berhak menolak permintaan fitur yang berada di luar ruang lingkup aplikasi.

PASAL 5
HOSTING & INFRASTRUKTUR

Biaya lisensi tidak termasuk biaya hosting, domain, server, dan layanan pihak ketiga lainnya.

Developer tidak bertanggung jawab atas gangguan, downtime, kehilangan data, atau kerusakan yang disebabkan oleh layanan hosting atau pihak ketiga.

Tanggung jawab pengelolaan hosting berada pada Klien atau penyedia hosting yang dipilih Klien.

PASAL 6
KEWAJIBAN DEVELOPER

Developer berkewajiban untuk:

Menyediakan aplikasi sesuai dengan fitur yang telah disepakati.

Memberikan perbaikan apabila terjadi bug pada fitur yang telah ada.

Menjaga kerahasiaan data Klien sebatas akses yang dimiliki Developer.

PASAL 7
KEWAJIBAN KLIEN

Klien berkewajiban untuk:

Menggunakan aplikasi sesuai dengan tujuan dan ketentuan yang berlaku.

Menjaga keamanan akun dan akses aplikasi.

Melakukan pembayaran tepat waktu sesuai perjanjian.

Tidak menggandakan, menjual, atau mendistribusikan aplikasi tanpa izin Developer.

PASAL 8
PENGHENTIAN SEBELUM MASA KONTRAK MINIMAL

Apabila Klien mengakhiri Perjanjian sebelum berakhirnya masa kontrak minimal 12 (dua belas) bulan, maka Klien tetap berkewajiban melunasi seluruh sisa biaya kontrak sampai masa kontrak minimal berakhir.

Penghentian layanan tidak menghapus kewajiban pembayaran Klien.

Alasan penghentian kerja sama, termasuk perubahan kebutuhan bisnis Klien, tidak membatalkan kewajiban pembayaran.

PASAL 9
KEPEMILIKAN & HAK CIPTA

Hak cipta dan kepemilikan source code aplikasi tetap menjadi milik Developer.

Klien hanya memperoleh hak penggunaan, bukan hak kepemilikan.

PASAL 10
PERSETUJUAN ELEKTRONIK

Dengan menekan tombol “Saya Setuju”, Klien menyatakan telah membaca, memahami, dan menyetujui seluruh isi Perjanjian ini.

Persetujuan elektronik ini memiliki kekuatan hukum yang sah dan mengikat.

PASAL 11
PENUTUP

Perjanjian ini berlaku sejak tanggal persetujuan dan mengikat Para Pihak sesuai ketentuan yang tercantum di dalamnya.`;

    const [isModalAgreementOpen, setIsModalAgreementOpen] = useState(false);
    const closeModal = () => {
        setIsModalAgreementOpen(false);
    };

    const [license, setLicense] = useState(null);

    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });

    const getLicense = async () => {
        try {
            const response = await axios.get("/api/get-license");
            setLicense(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getLicense();
    }, []);
    const isAgreementAccepted = license?.agreements && license.agreements.length > 0;
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
                <div>
                    <h1 className="text-2xl font-bold">Jour Apps (Accounting)</h1>
                    <p className="text-sm block">Eightnite Studio Copyright © 2023. All rights reserved</p>

                    <p className="text-sm block mt-4">Version</p>
                    <p className="text-sm block">{appVersion}</p>

                    <p className="text-sm block mt-4">License to</p>
                    <p className="text-sm block">{license?.client_name}</p>
                    {license?.is_active ? (
                        <>
                            <p className="text-sm block">Active Until: {formatDate(license?.preriod_end)}</p>
                            <p className={`text-sm block `}>
                                Payment Status:{" "}
                                <span className={`${license?.is_paid ? "text-green-500" : "text-red-500"} font-bold`}>
                                    {license?.is_paid ? "Paid" : "Unpaid"}
                                </span>
                            </p>
                        </>
                    ) : (
                        <button onClick={() => setIsModalAgreementOpen(true)} className="text-sm hover:underline hover:text-blue-500">
                            Activate License
                        </button>
                    )}
                    {isAgreementAccepted && license.agreements.length > 0 && (
                        <p className="text-sm block mt-4">
                            Agreement
                            <span className="block">Accepted at: {formatDateTime(license?.agreements?.[0]?.accepted_at)}</span>
                            <span className="block">Version: {license?.agreements?.[0]?.agreement_version}</span>
                            <button onClick={() => setIsModalAgreementOpen(true)} className="text-sm hover:underline hover:text-blue-500 block">
                                View License Agreement
                            </button>
                        </p>
                    )}
                </div>
                <Modal isOpen={isModalAgreementOpen} onClose={closeModal} modalTitle="License Agreement" maxWidth="max-w-lg">
                    <AgreementPage
                        agreementText={agreementText}
                        onSuccess={closeModal}
                        notification={setNotification}
                        fetchLicense={getLicense}
                        isAgreementAccepted={isAgreementAccepted}
                    />
                </Modal>
            </div>
        </>
    );
};

export default AboutPage;
