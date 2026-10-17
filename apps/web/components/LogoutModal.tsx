"use client";

import { signOut } from "next-auth/react";
import Modal from "./shared/Modal";
import Button from "./shared/Button";

interface LogoutModalProps {
    open: boolean;
    onClose: () => void;
}

export default function LogoutModal({ open, onClose }: LogoutModalProps) {
    const handleLogout = () => signOut({ callbackUrl: "/" });

    return (
        <Modal open={open} onClose={onClose} className="p-6 w-96">
            <h2 className="text-lg font-semibold mb-2">Log out?</h2>
            <p className="text-sm text-muted mb-6">
                You&apos;ll need to sign in again to access your chats.
            </p>
            <div className="flex justify-end gap-2">
                <Button label="Cancel" variant="ghost" onClick={onClose} />
                <Button label="Log out" variant="primary" onClick={handleLogout} />
            </div>
        </Modal>
    );
}
