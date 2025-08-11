"use client";
import Link from "next/link";

const NavLink = ({ active = false, children, ...props }) => (
    <Link
        {...props}
        className={`flex items-center hover:bg-yellow-200 hover:text-slate-700 hover:border-r-8 hover:border-orange-300 ${
            active ? "bg-blue-200 text-slate-700 border-r-8 border-yellow-300" : ""
        } transition-all duration-300 origin-left`}
    >
        {children}
    </Link>
);

export default NavLink;
