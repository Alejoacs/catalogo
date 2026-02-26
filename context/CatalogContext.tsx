"use client";

import { createContext, useContext } from "react";
import { useCatalog } from "@/hooks/useCatalog";

const CatalogContext = createContext<any>(null);

export const CatalogProvider = ({ children }: { children: React.ReactNode }) => {
  const catalog = useCatalog();

  return (
    <CatalogContext.Provider value={catalog}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalogContext must be used inside CatalogProvider");
  return context;
};