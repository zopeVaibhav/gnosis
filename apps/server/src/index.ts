import express from 'express';
import cors from 'cors';
import { env } from './configs/env.ts';
import appRoutes from './routes/index.ts';
import cookieParser from 'cookie-parser';
const app = express();

app.use(
    cors({
        origin: [env.WEB_ORIGIN],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', appRoutes);

app.listen(env.SERVER_PORT, () => {
    console.log(`Server running on port ${env.SERVER_PORT}`);
});
