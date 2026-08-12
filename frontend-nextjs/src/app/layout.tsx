import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.assessoria-interagir.com.br"),

  title: {
    default:
      "Assessoria Interagir | Gestão, Captação e Assessoria Jurídica para o Terceiro Setor",
    template: "%s | Assessoria Interagir",
  },

  description:
    "Assessoria especializada para organizações do terceiro setor em gestão estratégica, captação de recursos, segurança jurídica, certificações CEBAS e estruturação institucional.",

  applicationName: "Assessoria Interagir",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Assessoria Interagir | Assessoria para o Terceiro Setor",
    description:
      "Gestão estratégica, captação de recursos, segurança jurídica e certificações para organizações do terceiro setor.",
    url: "/",
    siteName: "Assessoria Interagir",
    images: [
      {
        url: "/favicon/logointeragir1200.jpeg",
        width: 1200,
        height: 630,
        alt: "Assessoria Interagir",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Assessoria Interagir | Assessoria para o Terceiro Setor",
    description:
      "Gestão estratégica, captação de recursos, segurança jurídica e certificações para organizações do terceiro setor.",
    images: ["/favicon/logointeragir1200.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>

      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}