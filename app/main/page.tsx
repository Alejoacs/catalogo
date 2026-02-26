"use client";

import { useState, useMemo, useEffect } from "react";
import { Pagination } from "@heroui/pagination";
import { useCatalogContext } from "@/context/CatalogContext";
import { ProductCard } from "@/components/ProductCard";
import { NavbarFilters } from "@/components/navbarfilters";

export default function Main() {
  const { productos, loading } = useCatalogContext();

  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Resetear a página 1 cuando cambien los productos
  useEffect(() => {
    setPage(1);
  }, [productos]);

  const totalPages = Math.ceil(productos.length / itemsPerPage);

  const productosPaginados = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return productos.slice(start, end);
  }, [page, productos]);

  return (
    <>
      <NavbarFilters />

      {loading && (
        <div className="p-6">
          <p>Cargando...</p>
        </div>
      )}

      {!loading && productos.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
            {productosPaginados.map((producto: any) => (
              <ProductCard
                key={`${producto.material}-${producto.color}-${producto.talla}`}
                producto={producto}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pb-8">
              <Pagination page={page} total={totalPages} onChange={setPage} showControls variant="bordered"
                classNames={{
                  cursor: "bg-black dark:bg-white dark:text-black"
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}