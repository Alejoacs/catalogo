"use client";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { User } from "@heroui/user";
import { signOut } from "next-auth/react";

export const DropdownUser = ({
    name,
    mail,
    picture,
    Country,
    type,
}: {
    name: string;
    mail: string;
    picture: string;
    Country: string;
    type: number;
}) => {
    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                {
                    type === 1 ? (
                        <Avatar
                            isBordered
                            as="button"
                            className="transition-transform"
                            src={picture}
                        />
                    ) : (
                        <User
                            as="button"
                            avatarProps={{
                                isBordered: true,
                                src: picture,
                            }}
                            className="transition-transform"
                            description={mail}
                            name={name}
                        />
                    )
                }
            </DropdownTrigger>

            <DropdownMenu aria-label="User Actions" variant="flat">
                {
                    type === 1 ? (
                        <DropdownItem key="profile" className="h-14 gap-2">
                            <p className="font-bold">{name}</p>
                            <p className="font-bold">{Country}</p>
                        </DropdownItem>
                    ) : (
                        <></>
                    )
                }

                <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() =>
                        signOut({
                            callbackUrl: "/",
                        })
                    }
                >
                    Cerrar sesión
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};