import formatNumber from "@/libs/formatNumber";
import { PlusCircleIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="group bg-white rounded-3xl px-4 py-3 shadow-md hover:border-indigo-300 border border-slate-200">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xs text-nowrap font-bold group-hover:translate-x-1 transition-transform duration-300 ease-out ">{product.name}</h1>
                    <small className="text-xs text-gray-500">Harga: {formatNumber(product.price)}</small>{" "}
                    <small className="text-xs text-gray-500">Stock: {product.end_stock}</small>
                    <small className="text-xs text-gray-500 ml-2">{product.category?.name}</small>
                </div>
                <button onClick={() => onAddToCart(product)} className="group-hover:scale-105 hover:text-blue-500 transition-transform duration-300 ease-out">
                    <PlusCircleIcon className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
