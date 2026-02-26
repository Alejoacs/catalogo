"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useCatalogContext } from "@/context/CatalogContext";
import { Image } from "@heroui/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure } from "@heroui/use-disclosure";
import { Select, SelectItem } from "@heroui/select";

type Producto = {
  material: string;
  nombre: string;
  calidad: string;
  cod_clas_vig: string;
  imagen: string;
};

const PLACEHOLDER =
  "https://placehold.co/1000x1000/png?text=Imagen+no+disponible";

const TOTAL_IMAGES = 7; // 🔥 ahora es dinámico fácilmente configurable

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

    return `https://imagenes.velez.com.co/Sistemas/${detalle.material}${selectedColorObj.SUB_ID}${String(
      imageIndex
    ).padStart(2, "0")}.jpg`;
  }, [selectedColorObj, imageIndex, detalle, producto]);

  /* ------------------ INVENTARIO FILTRADO ------------------ */
  const filteredInventory = useMemo(() => {
    if (!detalle?.inventarioRaw) return [];

    return detalle.inventarioRaw.filter((item: any) => {
      if (selectedColor && item.color !== selectedColor) return false;
      if (selectedTalla && item.talla !== selectedTalla) return false;
      if (selectedTienda && item.codigo !== selectedTienda) return false;
      return true;
    });
  }, [detalle, selectedColor, selectedTalla, selectedTienda]);

  const selectedInventory = filteredInventory[0];

  return (
    <>
      {/* CARD */}
      <Card
        className="py-4 hover:shadow-lg transition-shadow cursor-pointer"
        isPressable
        onPress={handleOpen}
      >
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">{producto.nombre}</p>
          <small className="text-default-500">
            Ref: {producto.material}
          </small>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Image
            alt={producto.nombre}
            src={imgSrc}
            onError={() => setImgSrc(PLACEHOLDER)}
            className="w-full h-full object-cover rounded-xl"
            width={270}
            height={300}
          />
        </CardBody>
      </Card>

      {/* MODAL */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{detalle?.nombre}</ModalHeader>
              <ModalBody>
                {loadingDetalle && <p>Cargando detalle...</p>}

                {!loadingDetalle && detalle && (
                  <div className="flex gap-8">

                    {/* IMAGEN + CONTROLES */}
                    <div className="w-1/2 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          onPress={() =>
                            setImageIndex((prev) =>
                              prev > 1 ? prev - 1 : TOTAL_IMAGES
                            )
                          }
                        >
                          ◀
                        </Button>

                        <Image
                          isZoomed
                          src={currentImage || PLACEHOLDER}
                          onError={() => setImgSrc(PLACEHOLDER)}
                          width={450}
                          className="rounded-xl object-cover"
                        />

                        <Button
                          size="sm"
                          onPress={() =>
                            setImageIndex((prev) =>
                              prev < TOTAL_IMAGES ? prev + 1 : 1
                            )
                          }
                        >
                          ▶
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500">
                        Imagen {imageIndex} de {TOTAL_IMAGES}
                      </p>
                    </div>

                    {/* PANEL DERECHO */}
                    <div className="w-1/2 flex flex-col gap-5">

                      {/* INFO GENERAL */}
                      <div>
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
                          <p className="text-lg font-bold">
                            {selectedInventory?.precio
                              ? Number(
                                selectedInventory.precio
                              ).toLocaleString("es-CO")
                              : "-"}{" "}
                            {selectedInventory?.moneda}
                          </p>

                          {selectedInventory?.descuento !== "0" &&
                            selectedInventory?.descuento && (
                              <p className="text-sm text-red-600">
                                {selectedInventory.descuento}% OFF
                              </p>
                            )}
                        </div>
                      </div>

                      {/* COLORES */}
                      {detalle.colores?.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Colores</h3>
                          <div className="flex gap-2 flex-wrap">
                            {detalle.colores.map((color: any) => (
                              <button
                                key={color.ID}
                                onClick={() => {
                                  setSelectedColor(color.ID);
                                  setImageIndex(1);
                                }}
                                className={`px-3 py-1 rounded border text-sm ${selectedColor === color.ID
                                    ? "bg-black text-white"
                                    : "bg-white"
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
                          <h3 className="font-semibold mb-2">Tallas</h3>
                          <div className="flex gap-2 flex-wrap">
                            {detalle.tallas.map((talla: string) => (
                              <button
                                key={talla}
                                onClick={() =>
                                  setSelectedTalla(talla)
                                }
                                className={`px-3 py-1 rounded border text-sm ${selectedTalla === talla
                                    ? "bg-black text-white"
                                    : "bg-white"
                                  }`}
                              >
                                {talla}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* FILTRO TIENDAS */}
                      <Select
                        size="sm"
                        label="Filtrar tienda"
                        onChange={(e) =>
                          setSelectedTienda(e.target.value)
                        }
                      >
                        {detalle.inventarioRaw
                          ?.reduce((acc: any, item: any) => {
                            if (!acc.find((x: any) => x.codigo === item.codigo)) {
                              acc.push({
                                codigo: item.codigo,
                                centro: item.centro,
                              });
                            }
                            return acc;
                          }, [])
                          .map((tienda: any) => (
                            <SelectItem key={tienda.codigo}>
                              {tienda.centro}
                            </SelectItem>
                          ))}
                      </Select>

                      {/* TABLA DISPONIBILIDAD */}
                      <table className="w-full text-sm border mt-2">
                        <thead className="bg-gray-100">
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
                              <td className="p-2">{item.talla}</td>
                              <td className="p-2">
                                {Number(item.cantidad)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

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
      </Modal>
    </>
  );
}