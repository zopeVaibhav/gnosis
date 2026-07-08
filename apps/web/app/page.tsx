import NavbarComponent from '@/src/components/NavbarComponent';
import HeroSection from '@/src/components/landing/HeroSection';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/options';

export default async function Page() {
    const session = await getServerSession(authOptions);
    return (
        <div className="flex flex-col min-h-screen">
            <NavbarComponent session={session} />
            <HeroSection session={session} />
        </div>
    );
}
