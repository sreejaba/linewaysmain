"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FilePlus,
    ClipboardList,
    UserPlus,
    LogOut,
    Calendar,
    X,
    LucideIcon
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

interface NavLink {
    name: string;
    href: string;
    icon: LucideIcon;
    subItems?: { name: string; href: string }[];
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { role, user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => signOut(auth);

    const staffLinks: NavLink[] = [
        { name: "Dashboard", href: "/staff", icon: LayoutDashboard },
        { name: "Request Leave", href: "/staff/request", icon: FilePlus },
        { name: "My History", href: "/staff/history", icon: ClipboardList },
    ];

    const adminLinks: NavLink[] = [
        { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
        {
            name: "Manage Requests",
            href: "/admin/requests",
            icon: Calendar,
            subItems: [
                { name: "Pending", href: "/admin/requests?status=Pending" },
                { name: "Approved", href: "/admin/requests?status=Approved" },
                { name: "Rejected", href: "/admin/requests?status=Rejected" },
                { name: "All", href: "/admin/requests?status=All" },
            ]
        },
        { name: "Staffs", href: "/admin/staffs", icon: ClipboardList },
        { name: "Register Staff", href: "/admin/register", icon: UserPlus },
        { name: "Register Multiple Staffs", href: "/admin/register-multi", icon: UserPlus },
    ];

    const links = role === "admin" ? adminLinks : staffLinks;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                    <span className="text-xl font-bold text-blue-600 tracking-tight">LMS Portal</span>
                    <button
                        className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        const hasSubItems = !!link.subItems && link.subItems.length > 0;

                        return (
                            <div key={link.name} className="space-y-1">
                                <Link
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive && !hasSubItems
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                                    {link.name}
                                </Link>

                                {hasSubItems && (
                                    <div className="ml-8 flex flex-col gap-1 border-l border-gray-100">
                                        {link.subItems?.map((sub) => (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "px-4 py-1.5 text-xs font-medium rounded-r-lg transition-colors border-l-2",
                                                    (mounted && (pathname + window.location.search === sub.href)) || (pathname === "/admin/requests" && sub.name === "Pending" && (mounted && !window.location.search))
                                                        ? "text-blue-700 bg-blue-50/50 border-blue-600"
                                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent"
                                                )}
                                            >
                                                {sub.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="border-t border-gray-200 p-4">
                    <div className="mb-4 flex items-center gap-3 px-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold uppercase shrink-0">
                            {user?.email?.[0] || "U"}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 truncate">{user?.email}</span>
                            <span className="text-xs text-gray-500 capitalize">{role}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
