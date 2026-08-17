import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";

export default async function Page() {
    const session = await getServerSession(authOptions);
    return (
        <div className="flex flex-col h-screen">
            <Navbar session={session} />
        </div>
    );
}
