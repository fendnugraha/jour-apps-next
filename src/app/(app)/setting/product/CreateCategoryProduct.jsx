import { useState } from "react";
import axios from "@/libs/axios";
import Input from "@/components/Input";
import Button from "@/components/Button";

const CreateCategoryProduct = ({ isModalOpen, notification, fetchProducts }) => {
    const [errors, setErrors] = useState([]);
    const [newCategoryProduct, setNewCategoryProduct] = useState({
        name: "",
        code_prefix: "",
    });

    const handleCreateCategoryProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/product-categories", newCategoryProduct);
            notification(response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setNewCategoryProduct({
                    name: "",
                    code_prefix: "",
                });
                isModalOpen(false);
            }

            fetchProducts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
        }
    };

    return (
        <form>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Category Name
                </label>
                <Input
                    type="text"
                    id="name"
                    value={newCategoryProduct.name}
                    onChange={(e) =>
                        setNewCategoryProduct({
                            ...newCategoryProduct,
                            name: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Enter category name"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="code_prefix" className="block mb-2 text-sm font-medium text-gray-900">
                    Kode Prefix
                </label>
                <Input
                    type="text"
                    id="code_prefix"
                    value={newCategoryProduct.code_prefix}
                    onChange={(e) =>
                        setNewCategoryProduct({
                            ...newCategoryProduct,
                            code_prefix: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${
                        errors.code_prefix ? "border-red-500" : ""
                    }`}
                    placeholder="Contoh:KPR"
                />
                {errors.code_prefix && <p className="text-red-500 text-xs">{errors.code_prefix}</p>}
            </div>
            <div>
                <Button
                    onClick={handleCreateCategoryProduct}
                    className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                >
                    Create
                </Button>
            </div>
        </form>
    );
};

export default CreateCategoryProduct;
