import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import ToastProvider from "@/providers/ToastProvider";

const jakarta = Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
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
        <html
            lang="en"
            className={`${jakarta.variable} ${geistMono.variable} h-full w-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <AuthProvider session={session}>
                    <QueryProvider>{children}</QueryProvider>
                </AuthProvider>
                <ToastProvider />
            </body>
        </html>
    );
}
