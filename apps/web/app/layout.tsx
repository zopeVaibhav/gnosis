import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionSetter from "@/providers/SessionSetter";
import AxiosBootstrap from "@/providers/AxiosBootstrap";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import ToastProvider from "@/providers/ToastProvider";

const inter = Inter({
    variable: "--font-dm-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Gnosis",
    description: "AI Knowledgebase Summarizer",
    icons: {
        icon: "/favicon.svg",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    return (
        <html lang="en" className={`${inter.variable} h-full w-full antialiased`}>
            <body className="min-h-full flex flex-col">
                {children}
                <SessionSetter session={session} />
                <AxiosBootstrap />
                <ToastProvider />
            </body>
        </html>
    );
}
