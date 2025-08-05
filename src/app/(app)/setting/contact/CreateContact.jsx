import Input from "@/components/Input";
import Label from "@/components/Label";
import { useState } from "react";
import axios from "@/libs/axios";
import { set } from "date-fns";

const CreateContact = ({ isModalOpen, notification, fetchContacts }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [type, setType] = useState("");

    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/contacts", {
                name,
                description,
                phone_number,
                address,
                type,
            });
            notification("success", response.data.message);
            // fetchContacts();
            isModalOpen(false);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        } finally {
            setLoading(false);
            setName(" ");
            setDescription(" ");
            setPhoneNumber(" ");
            setAddress(" ");
            setType(" ");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-2">
                <Label>Name</Label>
                <Input value={name} className={`w-full`} onChange={(e) => setName(e.target.value)} error={errors.name} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                    {" "}
                    <Label>Phone Number</Label>
                    <Input value={phone_number} className={`w-full`} onChange={(e) => setPhoneNumber(e.target.value)} error={errors.phone_number} />
                    {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number}</p>}
                </div>
                <div className="">
                    <Label>Type</Label>
                    <select
                        onChange={(e) => setType(e.target.value)}
                        value={type}
                        className="rounded-md w-full border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Select type</option>
                        <option value="Customer">Customer (Pelanggan)</option>
                        <option value="Supplier">Supplier (Vendor)</option>
                        <option value="Employee">Employee (Karyawan)</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                </div>
            </div>
            <div className="mb-2">
                <Label>Address</Label>
                <Input value={address} className={`w-full`} onChange={(e) => setAddress(e.target.value)} error={errors.address} />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>
            <div className="mb-2">
                <Label>Description</Label>
                <Input value={description} className={`w-full`} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>

            <div>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Loading..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default CreateContact;
