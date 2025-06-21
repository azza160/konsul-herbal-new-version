"use client";

import { Button } from "@/components/ui/button";

export function SimplePagination({
    currentPage,
    setCurrentPage,
    totalItems,
    perPage,
    itemName = "items",
}) {
    const totalPages = Math.ceil(totalItems / perPage);

    if (totalPages <= 1) {
        return null;
    }

    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex justify-between items-center mt-4 px-2 md:px-4">
            <p className="text-sm text-muted-foreground">
                Menampilkan {startItem} - {endItem} dari {totalItems} {itemName}
            </p>

            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ← Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                    Halaman {currentPage} / {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                >
                    Berikutnya →
                </Button>
            </div>
        </div>
    );
} 