import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const nextConfig: NextConfig = {
    /* config options here */
};

export default nextConfig;
