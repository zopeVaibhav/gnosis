"use client";

import Image from "next/image";
import Link from "next/link";

export default function AppLogo({ iconOnly = false, textOnly = false }) {
    return (
        <Link href={"/"} className="flex items-center">
            {!textOnly && (
                <Image
                    src="/logo-filled.png"
                    alt="Gnosis"
                    width={32}
                    height={32}
                    loading="eager"
                    style={{ width: "auto", height: "auto" }}
                />
            )}
            {!iconOnly && (
                <span className={`font-semibold text-xl ${!textOnly && !iconOnly ? "mx-2" : ""}`}>
                    Gnosis
                </span>
            )}
        </Link>
    );
}
