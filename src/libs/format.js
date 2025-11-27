import { differenceInDays, formatDistanceToNow } from "date-fns";

/**
 * Format angka dengan separator ribuan.
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
};

/**
 * Format angka menjadi format mata uang Rupiah.
 * @param {number} value
 * @returns {string}
 */
export const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format tanggal ke format 'DD/MM/YYYY'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
};

/**
 * Format tanggal ke format 'DD MMMM YYYY'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatLongDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

/**
 * Format tanggal dan jam ke format 'DD/MM/YYYY, HH:mm:ss'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // Use 12-hour format; set to false for 24-hour format
        timeZone: "Asia/Jakarta",
    });
};

export const todayDate = () => {
    const now = new Date();

    // Fungsi untuk memastikan angka memiliki dua digit (misal: 5 menjadi 05)
    const pad = (n) => `0${n}`.slice(-2);

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // getMonth() dimulai dari 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const TimeAgo = ({ timestamp }) => {
    return <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>;
};

export function formatNumberToK(num) {
    const absNum = Math.abs(num); // Ambil angka absolut (tanpa minus) untuk perhitungan
    let formatted;

    if (absNum >= 1_000_000_000) {
        formatted = (absNum / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (absNum >= 1_000_000) {
        formatted = (absNum / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (absNum >= 1_000) {
        formatted = (absNum / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
        formatted = absNum.toString(); // Di bawah 1000, tampilkan angka apa adanya
    }

    // Tambahkan minus jika angka awalnya negatif
    return num < 0 ? `-${formatted}` : formatted;
}

export function formatDuration(toDate = new Date(), fromDate) {
    const days = differenceInDays(toDate, new Date(fromDate));

    if (days < 7) {
        return `${days} Day${days > 1 ? "s" : ""}`;
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    } else if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} Month${months > 1 ? "s" : ""}`;
    } else {
        const years = Math.floor(days / 365);
        return `${years} Year${years > 1 ? "s" : ""}`;
    }
}

export const DateTimeNow = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const thisMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01T00:00`;
    const lastMonth = `${now.getFullYear()}-${pad(now.getMonth())}-01T00:00`;
    const thisYear = `${now.getFullYear()}-01-01T00:00`;
    const lastYear = `${now.getFullYear() - 1}-01-01T00:00`;

    const thisTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return { today, thisMonth, lastMonth, thisYear, lastYear, thisTime };
};

export const formatDurationTime = (to, from) => {
    const diffMs = new Date(to) - new Date(from); // selisih dalam milidetik
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

export const calculateFee = (amount, chunkSize = 2500000, feePerChunk = 5000, minFee = 3000, minAmount = 100000) => {
    if (amount < 10000 || amount === "") {
        return "";
    }

    if (amount < minAmount) {
        return minFee;
    }

    const chunkCount = Math.ceil(amount / chunkSize);
    return chunkCount * feePerChunk;
};
