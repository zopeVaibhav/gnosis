const BASE = 'openid email profile';
const GOOGLEAPIS = 'https://www.googleapis.com/auth';
const COMMON = { prompt: 'consent', access_type: 'offline' } as const;

export const GoogleAuth = {
    gmail: { ...COMMON, scope: `${BASE} ${GOOGLEAPIS}/gmail.readonly` },
    drive: { ...COMMON, scope: `${BASE} ${GOOGLEAPIS}/drive.readonly` },
    calendar: { ...COMMON, scope: `${BASE} ${GOOGLEAPIS}/calendar.readonly` },
    provider: { ...COMMON, scope: BASE, response_type: 'code' },
} as const;
