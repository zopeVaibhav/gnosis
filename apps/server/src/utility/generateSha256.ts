import crypto from 'crypto';

export const generateSha256 = (input: string) =>
    crypto.createHash('sha256').update(input).digest('hex');
