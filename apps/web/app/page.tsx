import ChatInputComponent from '@/src/components/ChatInputComponent';
import NavbarComponent from '@/src/components/NavbarComponent';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/options';

export default async function Page() {
    const session = await getServerSession(authOptions);
    return (
        <div className="flex flex-col h-screen">
            <NavbarComponent session={session} />
            <ChatInputComponent />
        </div>
    );
}
