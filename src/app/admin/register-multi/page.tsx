"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

export default function RegisterMultiStaffPage() {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <DashboardLayout allowedRole="admin">
            <div className="max-w-2xl mx-auto pb-10">
                <div className="mb-6 px-1">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Register Multiple Staffs</h1>
                    <p className="text-sm text-gray-500">Upload an Excel file to bulk register staff members.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {fileName && (
                        <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-3 border border-blue-100">
                            <FileSpreadsheet className="h-5 w-5" />
                            <span className="text-sm font-medium">{fileName}</span>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!fileName}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
