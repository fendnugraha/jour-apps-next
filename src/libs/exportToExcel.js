import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, headers, fileName = "data.xlsx", title = "Laporan Data") => {
    if (data.length === 0) {
        // notification("error", "Data tidak ditemukan.");
        return;
    }

    // **Ambil kunci data sesuai dengan header yang diberikan**
    const dataArray = data.map((item, index) => [
        index + 1, // Nomor urut otomatis
        ...headers.map((header) => item[header.key] || ""), // Ambil data sesuai dengan header
    ]);

    // Gabungkan title, header, dan data
    const finalData = [[title], [], ["No", ...headers.map((header) => header.label)], ...dataArray];

    // Buat worksheet & workbook
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // **Tambahkan styling ke header (bold & border)**
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

            if (!worksheet[cellAddress]) continue; // Skip jika sel kosong

            // Jika baris adalah header (baris ke-3 di array)
            if (R === 2) {
                worksheet[cellAddress].s = {
                    font: { bold: true }, // **Tebalkan font untuk header**
                    alignment: { horizontal: "center", vertical: "center" }, // Rata tengah
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } },
                    },
                };
            } else {
                // Tambahkan border untuk semua sel lain
                worksheet[cellAddress].s = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } },
                    },
                };
            }
        }
    }

    // Simpan file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(dataBlob, fileName);
};

export default exportToExcel;
