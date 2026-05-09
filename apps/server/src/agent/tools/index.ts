import { buildGmailTools } from './gmail';

export const buildTools = (userId: string) => [...buildGmailTools(userId)];
