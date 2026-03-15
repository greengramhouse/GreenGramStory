"use client";

import { useState } from "react";
import { employees } from "@/lib/data";
import { EmployeeTable } from "@/components/EmployeeTable";
import { CustomPagination } from "@/components/CustomPagination";

export default function EmployeePage() {
  // จัดการ State ของ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // จำนวนรายการต่อหน้า

  // คำนวณข้อมูลที่จะแสดงในหน้านั้นๆ (Client-side Pagination)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">รายชื่อพนักงาน</h1>
      
      {/* ส่งข้อมูลที่ถูกตัดแล้วไปให้ Table */}
      <EmployeeTable data={currentItems} />
      
      {/* ส่งค่า State และฟังก์ชันอัปเดตไปให้ Pagination */}
      {totalPages > 1 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}