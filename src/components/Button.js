const Button = ({ children, buttonType = "primary", className, ...props }) => {
    const buttonTypes = {
        primary: "bg-blue-500 hover:bg-blue-400 text-white",
        secondary: "bg-gray-500 hover:bg-gray-400 text-white",
        danger: "bg-red-500 hover:bg-red-400 text-white",
        warning: "bg-yellow-500 hover:bg-yellow-400 text-white",
        success: "bg-green-500 hover:bg-green-400 text-white",
    };
    return (
        <button {...props} className={`px-6 py-2 min-w-40 ${buttonTypes[buttonType]} ${className} rounded-xl text-sm cursor-pointer`}>
            {children}
        </button>
    );
};

export default Button;
