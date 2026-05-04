'use client';

import { goeyToast, GoeyToaster } from 'goey-toast';

export default function ToastProvider() {
    return <GoeyToaster position="top-right" />;
}

export const showToast = {
    success: (msg: string) => goeyToast.success(msg),
    error: (msg: string) => goeyToast.error(msg),
    warning: (msg: string) => goeyToast.warning(msg),
    info: (msg: string) => goeyToast.info(msg),
};
