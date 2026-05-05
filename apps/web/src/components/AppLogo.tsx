'use client';

import Image from 'next/image';

export default function AppLogoComponent({ iconOnly = false, textOnly = false }) {
    return (
        <div className="flex items-center">
            {!textOnly && (
                <Image src="/logo-filled.png" alt="Gnosis" width={32} height={32} loading="eager" />
            )}
            {!iconOnly && (
                <span className={`font-semibold text-xl ${!textOnly && !iconOnly ? 'mx-2' : ''}`}>
                    Gnosis
                </span>
            )}
        </div>
    );
}
