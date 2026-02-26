"use client";

import { Navbar } from "@/components/navbar";
import { ProfileProvider, useProfile } from "@/context/ProfileContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { setProfile } = useProfile();

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <ProfileProvider>
        <LayoutContent>{children}</LayoutContent>
      </ProfileProvider>
  );
}