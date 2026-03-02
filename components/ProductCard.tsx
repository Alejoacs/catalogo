"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useCatalogContext } from "@/context/CatalogContext";
import { Image } from "@heroui/image";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Spinner } from "@heroui/spinner";

type Producto = {
  material: string;
  nombre: string;
  calidad: string;
  cod_clas_vig: string;
  imagen: string;
  color: string;
};

const PLACEHOLDER = "https://placehold.co/1000x1000/png?text=Imagen+no+disponible";

const TOTAL_IMAGES = 5;

export function ProductCard({ producto }: { producto: Producto }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { fetchProductoDetalle } = useCatalogContext();

  const [imgSrc, setImgSrc] = useState(producto.imagen || PLACEHOLDER);
  const [detalle, setDetalle] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);
  const [selectedTienda, setSelectedTienda] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(1);

  useEffect(() => {
    setSelectedColor(null);
    setSelectedTalla(null);
    setSelectedTienda(null);
    setImageIndex(1);
  }, [detalle]);

  type TiendaItem = {
    key: string;
    label: string;
  };

  const tiendasAutocomplete: TiendaItem[] =
    detalle?.inventarioRaw
      ?.reduce((acc: TiendaItem[], item: any) => {
        if (!acc.find((x) => x.key === item.codigo)) {
          acc.push({
            key: item.codigo,
            label: item.centro,
          });
        }
        return acc;
      }, []) ?? [];

  useEffect(() => {
    if (!detalle?.colores?.length) return;

    // Intentar seleccionar el color del producto
    const colorFromProducto = detalle.colores.find(
      (c: any) => c.ID === producto?.color
    );

    if (colorFromProducto) {
      setSelectedColor(colorFromProducto.ID);
    } else {
      // Si no coincide, seleccionar el primero
      setSelectedColor(detalle.colores[0].ID);
    }

    setImageIndex(1);
  }, [detalle]);

  const tallasDisponibles = useMemo(() => {
    if (!detalle?.inventarioRaw || !selectedColor) return [];

    const tallasColor = new Set<string>();

    // 1️⃣ obtener tallas reales del inventario para ese color
    detalle.inventarioRaw.forEach((item: any) => {
      if (
        item.color === selectedColor &&
        item.talla &&
        item.talla !== "-"
      ) {
        tallasColor.add(item.talla); // ej: "003-TZD"
      }
    });

    // 2️⃣ buscar el objeto real en detalle.tallas usando ID + ATRIBUTO_EXTRA
    return detalle.tallas.filter((t: any) => {
      const tallaCode = `${t.ID}-${t.ATRIBUTO_EXTRA}`; // 👈 CLAVE
      return tallasColor.has(tallaCode);
    });

  }, [detalle, selectedColor]);

  const getNombreTalla = (tallaRaw: string) => {
    if (!detalle?.tallas?.length) return tallaRaw;

    const [id, atributo] = String(tallaRaw).split("-");

    const tallaObj = detalle.tallas.find(
      (t: any) =>
        String(t.ID) === id &&
        String(t.ATRIBUTO_EXTRA) === atributo
    );

    return tallaObj ? tallaObj.NOMBRE_MOSTRAR : tallaRaw;
  };

  const handleOpen = async () => {
    onOpen();
    setLoadingDetalle(true);
    const data = await fetchProductoDetalle(producto.material);
    setDetalle(data);
    setLoadingDetalle(false);
  };

  /* ------------------ COLOR SELECCIONADO ------------------ */
  const selectedColorObj = detalle?.colores?.find(
    (c: any) => c.ID === selectedColor
  );

  /* ------------------ IMAGEN DINÁMICA ------------------ */
  const currentImage = useMemo(() => {
    if (!selectedColorObj) return producto.imagen;

    return `https://imagenes.velez.com.co/Sistemas/${detalle.material}${selectedColorObj.SUB_ID}${String(imageIndex).padStart(2, "0")}.jpg`;
  }, [selectedColorObj, imageIndex, detalle, producto]);

  /* ------------------ INVENTARIO FILTRADO ------------------ */
  const filteredInventory = useMemo(() => {
    if (!detalle?.inventarioRaw) return [];

    return detalle.inventarioRaw.filter((item: any) => {
      if (selectedColor && item.color !== selectedColor) return false;
      if (selectedTalla && item.talla !== selectedTalla) return false; // 👈 aquí compara "003-TZD"
      if (selectedTienda && item.codigo !== selectedTienda) return false;
      return true;
    });
  }, [detalle, selectedColor, selectedTalla, selectedTienda]);

  const selectedInventory = filteredInventory[0];

  const getTallaCode = (talla: any) =>
    `${talla.ID}-${talla.ATRIBUTO_EXTRA}`;

  return (
    <>
      {/* CARD */}
      <Card className="py-4 hover:shadow-lg transition-shadow cursor-pointer" isPressable onPress={handleOpen}>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">{producto.nombre}</p>
          <small className="text-default-500">
            Ref: {producto.material}
          </small>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Image alt={producto.nombre} src={imgSrc} onError={() => setImgSrc(PLACEHOLDER)} className="w-full h-full object-cover rounded-xl" width={270} height={300} />
        </CardBody>
      </Card>

      {/* MODAL */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent className="h-[720px] max-h-[720px]">
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-center">{detalle?.nombre}</ModalHeader>
              <ModalBody className="flex-1 overflow-hidden">
                {loadingDetalle &&
                  <div className="w-full flex justify-center items-center h-full">
                    <Spinner variant="wave" color="default" size="lg"/>
                  </div>}

                {!loadingDetalle && detalle && (
                  <div className="flex gap-8 h-full">

                    {/* IMAGEN + CONTROLES */}
                    <div className="w-1/2 h-full relative flex items-center justify-center">

                      {/* Botón izquierdo */}
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="absolute left-4 z-10"
                        onPress={() =>
                          setImageIndex((prev) =>
                            prev > 1 ? prev - 1 : TOTAL_IMAGES
                          )
                        }
                      >
                        ◀
                      </Button>

                      {/* Imagen ocupa todo el espacio */}
                      <Image
                        src={currentImage}
                        onError={() => setImgSrc(PLACEHOLDER)}
                        className="w-full h-full object-contain"
                        classNames={{
                          wrapper: "w-full h-full",
                        }}
                      />

                      {/* Botón derecho */}
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="absolute right-4 z-10"
                        onPress={() =>
                          setImageIndex((prev) =>
                            prev < TOTAL_IMAGES ? prev + 1 : 1
                          )
                        }
                      >
                        ▶
                      </Button>

                      {/* Contador abajo */}
                      <div className="absolute bottom-4 text-xs text-gray-500">
                        Imagen {imageIndex} de {TOTAL_IMAGES}
                      </div>

                    </div>

                    {/* PANEL DERECHO */}
                    <div className="w-1/2 flex flex-col h-full">

                      {/* INFO GENERAL */}
                      <div className="">
                        <p className="font-semibold text-lg">
                          SKU: {detalle.material}
                          {selectedColor ?? ""}
                        </p>

                        <p className="text-sm">
                          EAN: {selectedInventory?.cod_ean ?? "-"}
                        </p>

                        <p className="text-sm">
                          Calidad: {detalle.calidad}
                        </p>

                        <div className="mt-2">
                          {selectedInventory?.precio ? (() => {

                            const precio = Number(selectedInventory.precio);
                            const descuento = Number(selectedInventory.descuento || 0);
                            const moneda = selectedInventory.moneda || "";

                            const tieneDescuento = descuento > 0;

                            const precioFinal = tieneDescuento
                              ? precio - (precio * descuento) / 100
                              : precio;

                            return (
                              <>
                                {/* Precio final */}
                                <p className="text-lg font-bold">
                                  {precioFinal.toLocaleString("es-CO", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 20, // permite decimales largos sin redondear visualmente
                                  })}{" "}
                                  {moneda}
                                </p>

                                {/* Precio anterior */}
                                {tieneDescuento && (
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm text-gray-500 line-through">
                                      {precio.toLocaleString("es-CO", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 20,
                                      })}{" "}
                                      {moneda}
                                    </p>

                                    <span className="text-sm text-red-600 font-semibold">
                                      -{descuento}%
                                    </span>
                                  </div>
                                )}
                              </>
                            );

                          })() : (
                            <p>-</p>
                          )}
                        </div>
                      </div>

                      {/* COLORES */}
                      {detalle.colores?.length > 0 && (
                        <div>
                          <h3 className="font-semibold my-2">Colores</h3>
                          <div className="flex gap-2 flex-wrap">
                            {detalle.colores.map((color: any) => (
                              <button
                                key={color.ID}
                                onClick={() => {
                                  setSelectedColor(color.ID);
                                  setImageIndex(1);
                                }}
                                className={`px-3 py-1 rounded border text-sm transition ${selectedColor === color.ID
                                  ? "bg-black text-white border-black"
                                  : "bg-white hover:bg-gray-100"
                                  }`}
                              >
                                {color.NOMBRE_MOSTRAR}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TALLAS */}
                      {detalle.tallas?.length > 0 && (
                        <div>
                          <h3 className="font-semibold my-2">Tallas</h3>
                          <div className="flex gap-2 flex-wrap">
                            {tallasDisponibles.map((talla: any) => {
                              const tallaCode = `${talla.ID}-${talla.ATRIBUTO_EXTRA}`;

                              return (
                                <button
                                  key={tallaCode}
                                  onClick={() =>
                                    setSelectedTalla(
                                      selectedTalla === tallaCode ? null : tallaCode
                                    )
                                  }
                                  className={`px-3 py-1 rounded border text-sm ${selectedTalla === tallaCode
                                    ? "bg-black text-white"
                                    : "bg-white"
                                    }`}
                                >
                                  {talla.NOMBRE_MOSTRAR}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* FILTRO TIENDAS */}
                      <Autocomplete
                        size="sm"
                        label="Filtrar tienda"
                        placeholder="Buscar tienda..."
                        className="mt-8"
                        selectedKey={selectedTienda ?? undefined}
                        onSelectionChange={(key) => setSelectedTienda(key as string)}
                        defaultItems={tiendasAutocomplete}
                      >
                        {(tienda: TiendaItem) => (
                          <AutocompleteItem key={tienda.key}>
                            {tienda.label}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>

                      {/* TABLA DISPONIBILIDAD */}
                      <div className="my-2 border rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                              <tr>
                                <th className="p-2 text-left">Tienda</th>
                                <th className="p-2 text-left">Talla</th>
                                <th className="p-2 text-left">Cantidad</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredInventory.map((item: any, i: number) => (
                                <tr key={i} className="border-t">
                                  <td className="p-2">{item.centro}</td>
                                  <td className="p-2">
                                    {getNombreTalla(item.talla)}
                                  </td>
                                  <td className="p-2 font-semibold">
                                    {Number(item.cantidad)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!loadingDetalle && !detalle && (
                  <p>No se encontró información del producto.</p>
                )}
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal >
    </>
  );
}