import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Central de Chamados Telecom",
  description: "Abertura e acompanhamento de chamados de efetivação de telecom.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
