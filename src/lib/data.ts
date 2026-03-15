export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
};

// สร้างข้อมูลจำลอง 25 รายการ
export const employees: Employee[] = Array.from({ length: 90 }).map((_, i) => ({
  id: `EMP-${(i + 1).toString().padStart(3, "0")}`,
  name: `พนักงาน คนที่ ${i + 1}`,
  email: `employee${i + 1}@company.com`,
  department: i % 3 === 0 ? "IT" : i % 2 === 0 ? "HR" : "Marketing",
}));