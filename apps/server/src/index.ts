import express from 'express';
import { env } from './configs/env.js';

const app = express();

app.listen(env.SERVER_PORT, () => {
    console.log(`Server running on port ${env.SERVER_PORT}`);
});
