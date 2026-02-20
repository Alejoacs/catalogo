"use client";

import { useCallback, useState } from "react";
import { Select, SelectItem } from "@heroui/select";
import {
  zonas,
  lineas,
  tiendas,
  calidad,
  sublineas,
  grupos,
  colores,
  tallas,
  clasesDeVigencia,
} from "@/config/data";

export default function Main() {
  const [selectedItems, setSelectedItems] = useState<Record<string, any>>({});
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeKey = (label: string) =>
    label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ /g, "");

  const handleFilterChange = useCallback(
    (filterLabel: string, itemKey: string, filterData: any[]) => {
      const filterKey = normalizeKey(filterLabel);
      const selectedItem = filterData.find((item) => item.key === itemKey);

      setSelectedItems((prev) => ({
        ...prev,
        [filterKey]: selectedItem,
      }));
    },
    []
  );

  const fetchProductos = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        zona: selectedItems.zona?.code || "",
        material: "",
        color: selectedItems.color?.key || "",
        talla: selectedItems.talla?.key || "",
        calidad: selectedItems.calidad?.code || "",
        pais: "COL",
        cod_tiendas: selectedItems.tienda?.code || "",
        cod_linea: selectedItems.linea?.code || "",
        cod_sublinea: selectedItems.sublinea?.key || "",
        cod_grupo: selectedItems.grupo?.key || "",
        cod_clas_vig: selectedItems.clasedevigencia?.key || "",
      };

      const response = await fetch(
        "https://l5243-iflmap.hcisbp.us2.hana.ondemand.com/http/catalogo_y2_prd",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || "Error consultando productos");
      }

      const data = await response.json();
      console.log("Respuesta completa SAP:", data);

      const productosFinal =
        data?.d?.results ??
        data?.results ??
        (Array.isArray(data) ? data : []);

      setProductos(productosFinal);
    } catch (err: any) {
      console.error("Error fetching productos:", err);
      setError(err.message || "Error inesperado");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const filterConfig = [
    { label: "Zona", data: zonas },
    { label: "Tienda", data: tiendas },
    { label: "Línea", data: lineas },
    { label: "Calidad", data: calidad },
    { label: "Sublínea", data: sublineas },
    { label: "Grupo", data: grupos },
    { label: "Color", data: colores },
    { label: "Talla", data: tallas },
    { label: "Clase de Vigencia", data: clasesDeVigencia },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-3 gap-4">
        {filterConfig.map((filter) => (
          <Select
            key={filter.label}
            label={filter.label}
            isRequired
            onChange={(e) =>
              handleFilterChange(
                filter.label,
                e.target.value,
                filter.data
              )
            }
          >
            {filter.data.map((item) => (
              <SelectItem key={item.key}>
                {item.label}
              </SelectItem>
            ))}
          </Select>
        ))}
      </div>

      <button
        onClick={fetchProductos}
        className="bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Consultando..." : "Buscar productos"}
      </button>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && (
        <p>{productos.length} productos cargados</p>
      )}
    </div>
  );
}