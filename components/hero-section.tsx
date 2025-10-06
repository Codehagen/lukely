import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import LogoClouds from "@/components/logo-clouds";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative border-b border-foreground/10 bg-muted/50">
      <section
        id="home"
        className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 text-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-16 mx-auto h-40 max-w-2xl rounded-t-full bg-gradient-to-b via-amber-50 to-purple-100 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-balance text-4xl font-semibold sm:mt-12 sm:text-6xl">
            Få flere leads enkelt med digitale julekalendere fra Lukely
          </h1>
          <p className="text-muted-foreground mb-8 mt-4 text-balance text-lg">
            Lag flerspråklige digitale julekalendere, samle GDPR-godkjente
            samtykker og omsett sesongengasjement til helårsomsetning med vår
            alt-i-ett plattform.
          </p>
          <Button asChild size="lg" className="px-4 text-sm">
            <Link href="/sign-up">Start gratis prøve</Link>
          </Button>
          <span className="text-muted-foreground mt-3 block text-center text-sm">
            Kom i gang med Lukely i løpet av 5 minutter
          </span>
        </div>
      </section>
      <section className="border-foreground/10 relative border-t">
        <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
          <div className="border-x">
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <Image
              className="border-t shadow-md"
              src="/hero-image.png"
              alt="Lukely-dashbord for kampanjeresultater"
              width={1280}
              height={720}
              sizes="(max-width: 640px) 768px, (max-width: 768px) 1024px, (max-width: 1024px) 1280px, 1280px"
            />
          </div>
        </div>
      </section>
      <LogoClouds />
    </div>
  );
}
