"use client";

import { Navbar as HeroUINavbar, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarBrand, NavbarItem, } from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo, } from "@/components/icons";
import { DropdownUser } from "./dropdownuser";
import { useSession } from "next-auth/react";

export const Navbar = () => {
  const searchInput = (
    <Input
      aria-label="Buscar"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Buscar..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  const { data: session } = useSession();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/main">
            <img src="/logo.png" className="w-30" alt="" />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <DropdownUser
            name={session?.user?.name ?? ""}
            mail={session?.user?.email ?? ""}
            picture={session?.user?.image ?? ""}
            Country={(session?.user as any)?.country ?? ""}
            type={1}
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="flex flex-col h-full">
        {/* arriba */}
        <div>
          {searchInput}
        </div>

        {/* abajo del todo */}
        <div className="mt-auto pb-4">
          <DropdownUser
            name={session?.user?.name ?? ""}
            mail={session?.user?.email ?? ""}
            picture={session?.user?.image ?? ""}
            Country={(session?.user as any)?.country ?? ""}
            type={2}
          />
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};