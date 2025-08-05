"use client";
import Input from "@/components/Input";
import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";

const CreateProduct = ({ isModalOpen, notification, fetchProducts, productCategories }) => {
    const [errors, setErrors] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category_id: "",
        price: 0,
        cost: 0,
        is_digital: false,
    });

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/products", newProduct);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setNewProduct({
                    name: "",
                    category: "",
                    price: 0,
                    cost: 0,
                    is_digital: false,
                });
            }
            isModalOpen(false);
            // console.log('Form reset:', newAccount, response.status)
            fetchProducts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        }
    };
    return (
        <form>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Product Name
                </label>
                <Input
                    type="text"
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                        setNewProduct({
                            ...newProduct,
                            name: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Enter product name"
                    autoComplete="off"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                    Category
                </label>
                <select
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.category ? "border-red-500" : ""
                    }`}
                    value={newProduct.category_id}
                    onChange={(e) =>
                        setNewProduct({
                            ...newProduct,
                            category_id: e.target.value,
                        })
                    }
                >
                    <option value="">Select category</option>
                    {productCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id}</p>}
            </div>
            <div className="flex gap-4 mb-4">
                <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900">
                        Price
                    </label>
                    <Input
                        type="number"
                        id="price"
                        value={newProduct.price}
                        onChange={(e) =>
                            setNewProduct({
                                ...newProduct,
                                price: e.target.value,
                            })
                        }
                        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                            errors.price ? "border-red-500" : ""
                        }`}
                        placeholder="Enter product price"
                    />
                    {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
                </div>
                <div>
                    <label htmlFor="cost" className="block mb-2 text-sm font-medium text-gray-900">
                        Cost
                    </label>
                    <Input
                        type="number"
                        id="cost"
                        value={newProduct.cost}
                        onChange={(e) =>
                            setNewProduct({
                                ...newProduct,
                                cost: e.target.value,
                            })
                        }
                        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                            errors.cost ? "border-red-500" : ""
                        }`}
                        placeholder="Enter product cost"
                    />
                    {errors.cost && <p className="text-red-500 text-xs">{errors.cost}</p>}
                </div>
            </div>
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="is_digital"
                    checked={newProduct.is_digital}
                    onChange={(e) =>
                        setNewProduct({
                            ...newProduct,
                            is_digital: e.target.checked,
                        })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_digital" className="ml-2 text-sm font-medium text-gray-900">
                    Produk Digital (Saldo)
                </label>
            </div>
            <div className="flex justify-end">
                <Button buttonType="primary" onClick={handleCreateProduct}>
                    Create
                </Button>
            </div>
        </form>
    );
};

export default CreateProduct;
