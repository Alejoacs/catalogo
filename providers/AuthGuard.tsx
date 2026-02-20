"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn("azure-ad");
    },
  });

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="h-12 w-12 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}