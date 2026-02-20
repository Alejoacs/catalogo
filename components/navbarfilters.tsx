import { useState } from "react";
import { SelectFilterNavbar } from "./selectfilternavbar";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { zonas, lineas, tiendas, calidad, sublineas, grupos, colores, tallas, clasesDeVigencia } from "@/config/data";
import { Card, CardBody } from "@heroui/card";

export const NavbarFilters = ({ onFilterChange }: any) => {
    const [moreFilters, setMoreFilters] = useState(false);

    return (
        <Card>
            <CardBody>
            <div className="grid grid-cols-3 gap-4">
                <SelectFilterNavbar label="Zona" items={zonas} required={true} color="default"/>
                <SelectFilterNavbar label="Linea" items={lineas} required={true} color="default"/>
                <SelectFilterNavbar label="Tienda" items={tiendas} required={true} color="default"/>
                <button onClick={() => setMoreFilters(!moreFilters)} className="text-sm text-blue-500 col-span-3">
                {
                    moreFilters ? "Menos filtros" : "Más filtros"
                }
                </button>

                {moreFilters && (
                <>
                    <SelectFilterNavbar label="Calidad" items={calidad} required={false} color="default"/>
                    <SelectFilterNavbar label="Sublinea" items={sublineas} required={false} color="default"/>
                    <SelectFilterNavbar label="Grupo" items={grupos} required={false} color="default"/>
                    <SelectFilterNavbar label="Color" items={colores} required={false} color="default"/>
                    <SelectFilterNavbar label="Talla" items={tallas} required={false} color="default"/>
                    <SelectFilterNavbar label="Clase de vigencia" items={clasesDeVigencia} required={false} color="default"/>
                    <div className="col-span-3 flex justify-center">
                        <CheckboxGroup color="primary" defaultValue={["con_inventario"]} orientation="horizontal">
                            <Checkbox value="solo_descuentos" size="sm">Solo Descuentos</Checkbox>
                            <Checkbox value="con_inventario" size="sm">Con Inventario</Checkbox>
                        </CheckboxGroup>
                    </div>
                </>
                )}
            </div>
            </CardBody>
        </Card>
    )
}