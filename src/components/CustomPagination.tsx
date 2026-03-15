import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CustomPaginationProps) {
  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // ฟังก์ชันคำนวณว่าจะแสดงเลขหน้าอะไรบ้าง และตรงไหนใส่ Ellipsis ("...")
  const getPaginationItems = () => {
    // ถ้าหน้าน้อยกว่าหรือเท่ากับ 7 แสดงทั้งหมดไปเลยไม่ต้องมี ...
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // คำนวณขอบเขตหน้าปัจจุบัน (ก่อนหน้า 1 และ หลัง 1)
    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;

    // กรณี 1: อยู่หน้าแรกๆ ซ่อนฝั่งขวา
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = [1, 2, 3, 4, 5];
      return [...leftRange, "ellipsis", totalPages];
    }

    // กรณี 2: อยู่หน้าท้ายๆ ซ่อนฝั่งซ้าย
    if (showLeftEllipsis && !showRightEllipsis) {
      const rightRange = [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
      return [1, "ellipsis", ...rightRange];
    }

    // กรณี 3: อยู่ตรงกลาง ซ่อนทั้งซ้ายและขวา
    if (showLeftEllipsis && showRightEllipsis) {
      const middleRange = [leftSiblingIndex, currentPage, rightSiblingIndex];
      return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
    }

    return [];
  };

  const paginationItems = getPaginationItems();

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        {/* ปุ่ม ย้อนกลับ */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePageChange(e, currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {/* เรนเดอร์หมายเลขหน้าและจุดไข่ปลา */}
        {paginationItems.map((item, index) => (
          <PaginationItem key={index}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(e) => handlePageChange(e, item as number)}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* ปุ่ม ถัดไป */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => handlePageChange(e, currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}