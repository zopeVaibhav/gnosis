import express from 'express';
import cors from 'cors';
import { env } from './configs/env.js';

const app = express();

app.use(
    cors({
        origin: [env.WEB_ORIGIN],
    }),
);

app.listen(env.SERVER_PORT, () => {
    console.log(`Server running on port ${env.SERVER_PORT}`);
});
