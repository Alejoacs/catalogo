"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Image } from "@heroui/image"
import { Button } from "@heroui/button"

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Fondo */}
      <img
        src="/background.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center blur-sm"
      />

      <section className="relative z-10 flex min-h-screen items-center justify-center flex-col gap-4">
        <Card className="text-tiny bg-white/40">
          <CardBody className="gap-4 flex items-center justify-center">
            <Image src="/logo.webp" width={300} height={50} className="object-cover" />
            <p className="text-xl font-medium font-serif">Catálogo de Productos</p>
            <Button onPress={() => signIn("azure-ad", { callbackUrl: "/main" })} className="bg-black text-white w-30" radius="lg" size="sm"  >
              Iniciar Sesión
            </Button>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}