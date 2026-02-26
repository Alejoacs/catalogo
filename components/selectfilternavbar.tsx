"use client";

import { useMemo } from "react";
import { Select, SelectItem } from "@heroui/select";

export type Item = {
  key: string;      // puede venir duplicado del backend
  label: string;
  raw?: unknown;
};

export type SelectFilterNavbarProps = {
  label: string;
  items: Item[];
  required?: boolean;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  selectedKey?: string;
  defaultSelectedKey?: string;
  onChange?: (key: string) => void;
};

// Hace keys únicas de forma determinística: 00C, 00C__2, 00C__3...
function makeUniqueKeys(items: Item[]) {
  const counts = new Map<string, number>();

  return items.map((it) => {
    const base = String(it.key);
    const n = (counts.get(base) ?? 0) + 1;
    counts.set(base, n);

    // 1ra vez se queda igual, repetidas se les agrega sufijo
    const uniqueKey = n === 1 ? base : `${base}__${n}`;

    return { ...it, key: uniqueKey };
  });
}

export const SelectFilterNavbar = ({
  label,
  items,
  required = false,
  color = "default",
  selectedKey,
  defaultSelectedKey,
  onChange,
}: SelectFilterNavbarProps) => {

  const safeItems = useMemo(() => makeUniqueKeys(items ?? []), [items]);

  const safeSelectedKey = useMemo(() => {
    if (!selectedKey) return undefined;

    const base = String(selectedKey);
    const found =
      safeItems.find((x) => x.key === base) ??
      safeItems.find((x) => x.key.startsWith(`${base}__`));

    return found?.key;
  }, [selectedKey, safeItems]);

  const safeDefaultKey = useMemo(() => {
    if (!defaultSelectedKey) return undefined;

    const base = String(defaultSelectedKey);
    const found =
      safeItems.find((x) => x.key === base) ??
      safeItems.find((x) => x.key.startsWith(`${base}__`));

    return found?.key;
  }, [defaultSelectedKey, safeItems]);

  return (
    <Select
      label={label}
      isRequired={required}
      color={color}
      size="sm"
      selectedKeys={safeSelectedKey ? [safeSelectedKey] : undefined}
      defaultSelectedKeys={
        !safeSelectedKey && safeDefaultKey ? [safeDefaultKey] : undefined
      }
      onChange={(e) => onChange?.(e.target.value)}
    >
      {safeItems.map((it) => (
        <SelectItem key={it.key} textValue={it.label}>
          {it.label}
        </SelectItem>
      ))}
    </Select>
  );
};