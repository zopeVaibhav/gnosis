'use client';

import { goeyToast, GoeyToaster, GoeyToastOptions } from 'goey-toast';

export default function ToastProvider() {
    return <GoeyToaster position="top-right" showProgress={false} />;
}

const goeyToastConfig: GoeyToastOptions = { showTimestamp: false };

export const showToast = {
    success: (msg: string) => goeyToast.success(msg, goeyToastConfig),
    error: (msg: string) => goeyToast.error(msg, goeyToastConfig),
    warning: (msg: string) => goeyToast.warning(msg, goeyToastConfig),
    info: (msg: string) => goeyToast.info(msg, goeyToastConfig),
};
