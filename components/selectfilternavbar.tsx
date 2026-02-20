import { Select, SelectItem } from "@heroui/select";

interface Item {
    key: string;
    label: string;
}

interface SelectFilterNavbarProps {
    items: Item[];
    label: string;
    required?: boolean;
    color: "primary" | "secondary" | "success" | "danger" | "warning" | "default" | undefined;
}

export const SelectFilterNavbar = ({ items, label, required, color, }: SelectFilterNavbarProps) => {
    const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedKey = e.target.value;
        const selectedItem = items.find((item) => item.key === selectedKey);
        
        if (selectedItem) {
            console.log("Selected item:", {
                key: selectedItem.key,
                label: selectedItem.label
            });
        }
    };

    return (
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
            <Select 
                className="max-w-xs" 
                label={label} 
                isRequired={required} 
                color={color}
                onChange={handleSelectionChange}
            >
                {items.map((item) => (
                    <SelectItem variant="shadow" color={color} key={item.key}>{item.label}</SelectItem>
                ))}
            </Select>
        </div>
    );
}
