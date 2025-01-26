import express from 'express';
import {register} from './metrics';

const app = express();

// Expose metrics at the /metrics endpoint
app.get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Start the server
export const startMetricsServer = (PORT: number) => {
    const environment: string = process.argv[2] || 'development';

    if(environment === 'test'){
        return;
    }

    app.listen(PORT, () => {
        console.log(`Metrics server running at http://localhost:${PORT}/metrics`);
    });
};
