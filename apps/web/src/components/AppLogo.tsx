'use client';

import Image from 'next/image';

export default function AppLogoComponent() {
    return (
        <div className="flex items-center">
            <Image src="/logo-filled.png" alt="Gnosis" width={32} height={32} loading="eager" />
            <span className="font-semibold mx-3">GNOSIS</span>
        </div>
    );
}
