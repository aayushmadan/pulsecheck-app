require('dotenv').config();

const app = require('./app');
const prisma = require('./prisma/client');
const { startUptimeCron, stopUptimeCron } = require('./cron/uptimeCron');

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, "0.0.0.0", () => {
  startUptimeCron();
  console.log(`PulseCheck API running at http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down PulseCheck...`);
  stopUptimeCron();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
