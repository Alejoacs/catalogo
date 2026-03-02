import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { addToast } from "@heroui/toast";

interface NavbarProps {
    onProfileLoaded?: (profile: any) => void;
    onFiltersChange?: (filters: any) => void;
}

export function useCatalog() {
    const [token, setToken] = useState<string | null>(null);
    const [filters, setFilters] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<Record<string, any>>({});
    const [productos, setProductos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [countryCode, setCountryCode] = useState<string>("N/A");
    const [modo, setModo] = useState<"D" | "C" | "X">("C");
    const [materialSearch, setMaterialSearch] = useState<string>("");

    const { data: session } = useSession();

    const fetchToken = async () => {
        try {
            const response = await fetch("https://api-rg-cv-aura-prd.azure-api.net/AURA/token?subscription-key=d72bb7e5e43b447fb4e59c91d3aae9f0", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            setToken(data.access_token);
        } catch (err: any) {
            console.error("Error fetching token:", err);
        }
    };

    const fetchProfile = async () => {
        const res = await fetch(
            "https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName,country",
            {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            }
        );

        const profile = await res.json();

        // Diccionario de países
        const countryMap: Record<string, string> = {
            colombia: "COL",
            chile: "CHL",
            perú: "PER",
            panamá: "PAN",
            guatemala: "GTM",
        };

        // Normalizamos a minúsculas para evitar problemas
        const normalizedCountry = profile.country?.toLowerCase() ?? "";

        const countryCode =
            countryMap[normalizedCountry] ?? "N/A";

        setProfile(profile);
        setCountryCode(countryCode);
    };

    const fetchFilters = async () => {
        try {
            const response = await fetch(
                `https://api-rg-cv-aura-prd.azure-api.net/catalogo/filtros_catalogo?pais=${countryCode}&subscription-key=d72bb7e5e43b447fb4e59c91d3aae9f0`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();
            setFilters(data.select_response.row);
            console.log(data)
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchProductos = async () => {
        if (!token) return;

        setLoading(true);
        setProductos([]);

        try {
            const payload = {
                zona: selectedItems.Zona?.raw?.ID || "",
                cod_ean: "",
                modo: modo || "",
                material: materialSearch || "",
                color: selectedItems.Color?.raw?.ID || "",
                talla: selectedItems.Talla?.raw?.SUB_ID || "",
                calidad: selectedItems.Calidad?.raw?.code || "",
                pais: countryCode,
                cod_tiendas: selectedItems.Tienda?.raw?.ID
                    ? [selectedItems.Tienda.raw.ID]
                    : [""],
                cod_linea: selectedItems.Linea?.raw?.ID || "",
                cod_sublinea: selectedItems.sublinea?.raw?.ID || "",
                cod_grupo: selectedItems.grupo?.raw?.ID || "",
                cod_clas_vig: selectedItems.clasedevigencia?.raw?.ID || "",
            };

            const response = await fetch(
                "https://api-rg-cv-aura-prd.azure-api.net/catalogo/catalogo_y2_prd?subscription-key=d72bb7e5e43b447fb4e59c91d3aae9f0",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                addToast({
                    title: "Error",
                    description: "Los filtros ingresados no son válidos. Por favor, verifica tu selección e intenta nuevamente.",
                    color: "danger",
                });
                return;
            }

            if (data.length === 0) {
                addToast({
                    title: "Sin resultados",
                    description: "No se encontraron productos con los filtros seleccionados.",
                    color: "warning",
                });
                return;
            }

            const colorFilters = filters.filter(
                (f: any) => f.TIPO_FILTRO === "COLOR"
            );

            const productosTransformados = data.map((producto: any) => {
                const colorMatch = colorFilters.find(
                    (c: any) => c.ID === producto.color
                );

                return {
                    ...producto,
                    color_sub_id: colorMatch?.SUB_ID ?? null,
                    imagen: colorMatch
                        ? `https://imagenes.velez.com.co/Sistemas/${producto.material}${colorMatch.SUB_ID}01.jpg`
                        : `https://placehold.co/600x800/png?text=Imagen+no+disponible`,
                };
            });

            setProductos(productosTransformados);
        } catch (error) {
            console.error(error);

            addToast({
                title: "Error",
                description: "Ocurrió un error al consultar los productos.",
                color: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchProductoDetalle = async (material: string) => {
        if (!token) return null;

        try {
            const payload = {
                zona: selectedItems.Zona?.raw?.ID || "",
                cod_ean: "",
                modo: "",
                material: material || "",
                color: "",
                talla: "",
                calidad: selectedItems.Calidad?.raw?.code || "",
                pais: countryCode,
                cod_tiendas: [""],
                cod_linea: "",
                cod_sublinea: "",
                cod_grupo: "",
                cod_clas_vig: "",
            };

            const response = await fetch(
                "https://api-rg-cv-aura-prd.azure-api.net/catalogo/catalogo_y2_prd?subscription-key=d72bb7e5e43b447fb4e59c91d3aae9f0",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Error al consultar detalle");

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) return null;

            const base = data[0];

            const colorFilters = filters.filter((f: any) => f.TIPO_FILTRO === "COLOR");
            const tallaFilters = filters.filter((f: any) => f.TIPO_FILTRO === "TALLA");

            const coloresMap = new Map<string, any>();
            const tallasMap = new Map<string, any>();
            const tiendasMap = new Map<string, any>();

            // ✅ 1) PRIMERO: obtener tallas reales del inventario
            const tallasDisponibles = new Set<string>();
            data.forEach((item: any) => {
                if (item.talla && item.talla !== "-") {
                    tallasDisponibles.add(String(item.talla)); // ej "003-TZD"
                }
            });

            // ✅ 2) LUEGO: con esas tallas, buscar el objeto real en filtros
            tallasDisponibles.forEach((tallaCode) => {
                const [idParte, attrParte] = tallaCode.split("-"); // "003", "TZD"
                if (!idParte || !attrParte) return;

                const tallaMatch = tallaFilters.find(
                    (t: any) =>
                        String(t.ID) === String(idParte) &&
                        String(t.ATRIBUTO_EXTRA) === String(attrParte)
                );

                if (tallaMatch) {
                    // guardo el objeto completo del filtro, como haces con colores
                    tallasMap.set(tallaMatch.ID + "-" + tallaMatch.ATRIBUTO_EXTRA, tallaMatch);
                }
            });

            // colores + tiendas (igual que ya haces)
            data.forEach((item: any) => {
                const colorMatch = colorFilters.find((c: any) => c.ID === item.color);
                if (colorMatch) coloresMap.set(colorMatch.ID, colorMatch);

                if (item.codigo && item.centro) {
                    const nombreCentro = item.centro.split("-")[1] ?? item.centro;
                    tiendasMap.set(item.codigo, {
                        codigo: item.codigo,
                        nombre: nombreCentro.trim(),
                        cantidad: item.cantidad,
                        cod_almacen: item.cod_almacen,
                    });
                }
            });

            const detalleAgrupado = {
                ...base,
                colores: Array.from(coloresMap.values()),
                // ✅ objetos reales de talla (filtros)
                tallas: Array.from(tallasMap.values()).sort(
                    (a: any, b: any) => Number(a.NOMBRE_MOSTRAR) - Number(b.NOMBRE_MOSTRAR)
                ),
                inventarioRaw: data,
                totalTiendas: tiendasMap.size,
                totalColores: coloresMap.size,
                totalTallas: tallasMap.size,
            };

            console.log(detalleAgrupado)
            return detalleAgrupado;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    useEffect(() => {
        if (session?.accessToken) {
            fetchProfile();
        }
    }, [session?.accessToken]);

    useEffect(() => {
        fetchToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetchFilters();
        }
    }, [token]);

    return {
        filters,
        selectedItems,
        setSelectedItems,
        productos,
        loading,
        profile,
        fetchProductos,
        modo,
        setModo,
        materialSearch,
        setMaterialSearch,
        fetchProductoDetalle,
    };
}