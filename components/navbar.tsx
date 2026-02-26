"use client";

import { Navbar as HeroUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem, } from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { DropdownUser } from "./dropdownuser";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useCatalogContext } from "@/context/CatalogContext";

export const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { profile, setMaterialSearch } = useCatalogContext();
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const searchInput = (
    <Input
      aria-label="Buscar"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Buscar por material (7 dígitos)"
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      value={localSearch}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, ""); // solo números

        if (value.length <= 7) {
          setLocalSearch(value);

          // 👇 se actualiza automáticamente
          if (/^\d{7}$/.test(value)) {
            setMaterialSearch(value);
          } else {
            setMaterialSearch("");
          }
        }
      }}
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/main">
            <img src={isDark ? "/logod.png" : "/logo.png"} className="w-30" alt="Logo de Velez" />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end" >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <DropdownUser name={profile?.displayName ?? ""} mail={profile?.mail ?? ""} picture={profile?.picture ?? ""} Country={profile?.countryCode ?? ""} type={1} />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="flex flex-col h-full">
        <div>
          {searchInput}
        </div>

        <div className="mt-auto pb-4">
          <DropdownUser name={profile?.displayName ?? ""} mail={profile?.mail ?? ""} picture={profile?.picture ?? ""} Country={profile?.countryCode ?? ""} type={2} />
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};