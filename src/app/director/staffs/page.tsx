"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import EditStaffModal from "./EditStaffModal";
import { Users, AlertCircle, Calendar, Pencil } from "lucide-react";
import { format, startOfYear, endOfYear } from "date-fns";

// ... (StaffData interface remains the same)
interface StaffData {
    id: string;
    email: string;
    displayName: string;
    department?: string;
    designation?: string;
    salutation?: string;
    dateOfJoining?: string;
    service?: string;
    appointmentNo?: string;
    status?: string;
    leavesUsed: number;
}

export default function AdminStaffOverview() {
    const [staffs, setStaffs] = useState<StaffData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffData | null>(null);

    // ... (useEffect hook remains roughly the same, but we need to ensure we map all fields)
    useEffect(() => {
        if (!db) return;
        // 1. Fetch all staff members
        const staffQuery = query(collection(db, "users"), where("role", "in", ["staff", "princi"]));

        // 2. Fetch all approved leaves for the current year
        const currentYear = new Date().getFullYear();
        const yearStart = format(startOfYear(new Date()), "yyyy-MM-dd");
        const yearEnd = format(endOfYear(new Date()), "yyyy-MM-dd");

        const unsubUsers = onSnapshot(staffQuery, (userSnap) => {
            const users = userSnap.docs.map(doc => ({
                id: doc.id,
                email: doc.data().email,
                displayName: doc.data().displayName || "N/A",
                department: doc.data().department || "-",
                designation: doc.data().designation || "-",
                // capture other fields for editing
                salutation: doc.data().salutation,
                dateOfJoining: doc.data().dateOfJoining,
                service: doc.data().service,
                appointmentNo: doc.data().appointmentNo,
                status: doc.data().status,
                leavesUsed: 0
            }));

            // ... (leaves fetching logic stays the same)
            const leavesQuery = query(
                collection(db, "leaves"),
                where("status", "==", "Approved")
            );

            const unsubLeaves = onSnapshot(leavesQuery, (leaveSnap) => {
                const leaves = leaveSnap.docs.map(doc => doc.data());

                const updatedStaffs = users.map(user => {
                    const userYearLeaves = leaves.filter(leave =>
                        leave.userId === user.id &&
                        leave.fromDate >= yearStart &&
                        leave.fromDate <= yearEnd
                    );
                    return {
                        ...user,
                        leavesUsed: userYearLeaves.reduce((sum, leave) => sum + (leave.leaveValue || 0), 0)
                    };
                });

                setStaffs(updatedStaffs);
                setLoading(false);
            }, (err) => {
                console.error("Leaves fetch error:", err);
                setError("Failed to fetch leave data.");
                setLoading(false);
            });

            return () => unsubLeaves();

        }, (err) => {
            console.error("Users fetch error:", err);
            setError("Failed to fetch staff data.");
            setLoading(false);
        });

        return () => unsubUsers();
    }, []);

    return (
        <DashboardLayout allowedRole="dir">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Staff Overview
                    </h1>
                    <p className="text-sm text-gray-500">
                        View all staff members and their leave usage for {mounted ? new Date().getFullYear() : ""}.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Mobile View: Cards */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading staff data...</div>
                    ) : staffs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 italic bg-white rounded-xl border border-gray-100">
                            No staff members found.
                        </div>
                    ) : (
                        staffs.map((staff) => (
                            <div key={staff.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                                            {staff.displayName?.[0] || staff.email?.[0]}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className="font-bold text-gray-900 truncate">{staff.displayName}</h3>
                                            <p className="text-xs text-gray-500 truncate">{staff.department} • {staff.designation}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{staff.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setEditingStaff(staff)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Leave Used ({mounted ? new Date().getFullYear() : ""})</span>
                                    </div>
                                    <span className="text-lg font-black text-blue-700">{staff.leavesUsed} Days</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Leave Used ({mounted ? new Date().getFullYear() : ""})</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading staff data...</td></tr>
                                ) : staffs.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">No staff members registered.</td></tr>
                                ) : (
                                    staffs.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase text-sm">
                                                        {staff.displayName?.[0] || staff.email?.[0]}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{staff.displayName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{staff.designation}</span>
                                                    <span className="text-xs text-gray-500">{staff.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{staff.email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-black text-sm">
                                                    {staff.leavesUsed} Days
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setEditingStaff(staff)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Details"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {editingStaff && (
                    <EditStaffModal
                        staff={editingStaff}
                        onClose={() => setEditingStaff(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
