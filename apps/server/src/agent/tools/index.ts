import { buildGmailTools } from './gmail';

export const buildTools = (userId: string) => [...buildGmailTools(userId)];

export const buildToolMap = (userId: string) =>
    Object.fromEntries(buildTools(userId).map((t) => [t.name, t]));
