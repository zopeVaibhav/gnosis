import express from 'express';

const PORT = process.env.DB_PORT || 8080;

const app = express();

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});
