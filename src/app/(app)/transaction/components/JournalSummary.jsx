import formatNumber from "@/libs/formatNumber";
import { MinusCircle, PlusCircle } from "lucide-react";

const JournalSummary = ({ journal, selectedAccount }) => {
    const filteredJournals = journal.data?.summary?.filter((j) => j.debt?.id === Number(selectedAccount) || j.cred?.id === Number(selectedAccount));

    const mainAccountName =
        filteredJournals?.[0]?.debt?.id === Number(selectedAccount) ? filteredJournals?.[0]?.debt?.acc_name : filteredJournals?.[0]?.cred?.acc_name;

    // 🔥 Gabung lawan akun + sum total
    const grouped = filteredJournals?.reduce((acc, j) => {
        const isDebit = j.debt?.id === Number(selectedAccount);
        const oppositeName = isDebit ? j.cred?.acc_name : j.debt?.acc_name;

        if (!acc[oppositeName]) {
            acc[oppositeName] = { debit: 0, credit: 0 };
        }

        if (isDebit) {
            acc[oppositeName].debit += j.total;
        } else {
            acc[oppositeName].credit += j.total;
        }

        return acc;
    }, {});

    return (
        <div className="bg-white p-4 rounded-3xl">
            <h1 className="text-xl font-bold mb-4">
                Journal Summary
                <span className="text-xs text-gray-500 block">{mainAccountName}</span>
            </h1>

            {grouped &&
                Object.entries(grouped).map(([oppositeName, values], i) => (
                    <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                        <h2 className="text-sm font-semibold mb-2">{oppositeName}</h2>
                        <div className="flex justify-between text-sm">
                            <h1 className="flex gap-1 items-center">
                                <PlusCircle size={20} className="text-green-500" /> {formatNumber(values.debit)}
                            </h1>
                            <h1 className="flex gap-1 items-center">
                                <MinusCircle size={20} className="text-red-500" /> {formatNumber(values.credit)}
                            </h1>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default JournalSummary;
