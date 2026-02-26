"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { SelectFilterNavbar, Item } from "./selectfilternavbar";
import { calidad as calidadConfig } from "@/config/data";
import { useCatalogContext } from "@/context/CatalogContext";

type ApiFilterRow = {
  TIPO_FILTRO: string;
  key?: string | number;
  ID?: string | number;
  SUB_ID?: string | number;
  code?: string | number;
  value?: string | number;
  NOMBRE_MOSTRAR?: string;
  label?: string;
  nombre?: string;
  name?: string;
  [k: string]: unknown;
};

type NavbarFiltersProps = {
  filters: ApiFilterRow[] | Record<string, ApiFilterRow>;
  onFilterChange?: (args: {
    filterLabel: string;
    selectedKey: string;
    selectedItem: Item | null;
    items: Item[];
  }) => void;
};

export const NavbarFilters = () => {
  const [moreFilters, setMoreFilters] = useState(false);
  const { filters, setSelectedItems, selectedItems, fetchProductos, setModo } = useCatalogContext();
  const zonaSeleccionada = !!selectedItems?.Zona;

  const cfg = useMemo(() => {
    const arr: ApiFilterRow[] = Array.isArray(filters)
      ? filters
      : (Object.values(filters ?? {}) as ApiFilterRow[]);

    const byType = (t: string) => arr.filter((f) => f.TIPO_FILTRO === t);

    const toItems = (xs: ApiFilterRow[]): Item[] =>
      (xs ?? []).map((x) => {
        const key =
          x.key ?? x.ID ?? x.SUB_ID ?? x.code ?? x.value ?? x.NOMBRE_MOSTRAR ?? x.label ?? x.name ?? "";

        const label =
          x.NOMBRE_MOSTRAR ?? x.label ?? x.nombre ?? x.name ?? String(key);

        return {
          key: String(key),
          label: String(label),
          raw: x,
        };
      });

    // calidadConfig puede venir con estructura diferente, igual lo adaptamos
    const toItemsAny = (xs: any[]): Item[] =>
      (xs ?? []).map((x) => ({
        key: String(x.key ?? x.code ?? x.ID ?? x.value ?? x.label ?? x.nombre ?? x.name ?? ""),
        label: String(x.label ?? x.nombre ?? x.name ?? x.NOMBRE_MOSTRAR ?? x.key ?? x.code ?? ""),
        raw: x,
      }));

    return {
      zonas: toItems(byType("ZONA")),
      tiendas: toItems(byType("CENTRO")),
      lineas: toItems(byType("LINEA")),
      calidad: toItemsAny(calidadConfig),
      sublineas: toItems(byType("SUBLINEA")),
      grupos: toItems(byType("GRUPO")),
      colores: toItems(byType("COLOR")),
      tallas: toItems(byType("TALLA")),
      clasesDeVigencia: toItems(byType("VIGENCIA")),
    };
  }, [filters]);

  const emitChange = (filterLabel: string, selectedKey: string, items: Item[]) => {
    const selectedItem = items.find((i) => i.key === selectedKey) ?? null;

    setSelectedItems((prev: any) => ({
      ...prev,
      [filterLabel]: selectedItem,
    }));
  };

  useEffect(() => {
    if (cfg.calidad.length > 0) {
      emitChange("Calidad", cfg.calidad[0].key, cfg.calidad);
    }
  }, [cfg.calidad]);

  const handleClear = () => {
    const zonaActual = selectedItems?.Zona ?? null;

    // Restaurar calidad al primero si existe
    const calidadDefault =
      cfg.calidad.length > 0 ? cfg.calidad[0] : null;

    setSelectedItems({
      Zona: zonaActual,
      Calidad: calidadDefault,
    });

    // Restaurar modo por defecto
    setModo("C");
  };

  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-3 gap-4">
          <SelectFilterNavbar label="Zona" items={cfg.zonas} required color="default" onChange={(key) => emitChange("Zona", key, cfg.zonas)} />

          <SelectFilterNavbar label="Tienda" items={cfg.tiendas} color="default" onChange={(key) => emitChange("Tienda", key, cfg.tiendas)} />

          <SelectFilterNavbar label="Linea" items={cfg.lineas} color="default" onChange={(key) => emitChange("Linea", key, cfg.lineas)} />

          {moreFilters && (
            <>
              <SelectFilterNavbar label="Calidad" items={cfg.calidad} color="default" defaultSelectedKey={cfg.calidad[0]?.key} onChange={(key) => emitChange("Calidad", key, cfg.calidad)} />

              <SelectFilterNavbar label="Sublinea" items={cfg.sublineas} color="default" onChange={(key) => emitChange("Sublinea", key, cfg.sublineas)} />

              <SelectFilterNavbar label="Grupo" items={cfg.grupos} color="default" onChange={(key) => emitChange("Grupo", key, cfg.grupos)} />

              <SelectFilterNavbar label="Color" items={cfg.colores} color="default" onChange={(key) => emitChange("Color", key, cfg.colores)} />

              <SelectFilterNavbar label="Talla" items={cfg.tallas} color="default" onChange={(key) => emitChange("Talla", key, cfg.tallas)} />

              <SelectFilterNavbar label="Clase de vigencia" items={cfg.clasesDeVigencia} color="default" onChange={(key) => emitChange("Clase de vigencia", key, cfg.clasesDeVigencia)} />

              <div className="col-span-3 flex justify-center">
                <CheckboxGroup color="default" defaultValue={["con_inventario"]} orientation="horizontal"
                  onValueChange={(vals) => {
                    const descuentos = vals.includes("solo_descuentos");
                    const inventario = vals.includes("con_inventario");

                    if (descuentos) {
                      setModo("D");        // prioridad
                    } else if (inventario) {
                      setModo("C");
                    } else {
                      setModo("X");
                    }
                  }}
                >
                  <Checkbox value="solo_descuentos" size="sm">
                    Solo Descuentos
                  </Checkbox>

                  <Checkbox value="con_inventario" size="sm">
                    Con Inventario
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </>
          )}

          <div className="col-span-3 flex justify-end pr-4 gap-8">
            <button type="button" className="text-smcol-span-3" onClick={handleClear}>
              Limpiar filtros
            </button>
            <button type="button" onClick={() => setMoreFilters((v) => !v)} className="text-sm col-span-3">
              {moreFilters ? "Menos filtros" : "Más filtros"}
            </button>
            <button
              className={`px-2 py-2 rounded text-[14px] ${zonaSeleccionada
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              disabled={!zonaSeleccionada}
              onClick={fetchProductos}
            >
              Buscar
            </button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};