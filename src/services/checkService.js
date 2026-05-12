const axios = require('axios');
const prisma = require('../prisma/client');
const HttpError = require('../utils/httpError');

const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 10000);
const CHECK_RETENTION_PER_MONITOR = Number(process.env.CHECK_RETENTION_PER_MONITOR || 500);
const LAST_CHECKS_FOR_STATS = 100;

function shouldRunMonitor(monitor, now = new Date()) {
  const minute = now.getUTCMinutes();
  return minute % monitor.interval === 0;
}

async function runMonitorCheck(monitor) {
  const startedAt = process.hrtime.bigint();
  let status = 'DOWN';
  let statusCode = null;

  try {
    const response = await axios.get(monitor.url, {
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'PulseCheck/1.0'
      }
    });

    statusCode = response.status;
    status = statusCode >= 200 && statusCode <= 399 ? 'UP' : 'DOWN';
  } catch (error) {
    statusCode = error.response?.status || null;
  }

  const endedAt = process.hrtime.bigint();
  const responseTime = Math.max(0, Math.round(Number(endedAt - startedAt) / 1_000_000));

  const check = await prisma.check.create({
    data: {
      monitorId: monitor.id,
      status,
      statusCode,
      responseTime
    }
  });

  await trimChecksForMonitor(monitor.id);
  return check;
}

async function runDueChecks(now = new Date()) {
  const monitors = await prisma.monitor.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' }
  });

  const dueMonitors = monitors.filter((monitor) => shouldRunMonitor(monitor, now));
  const results = await Promise.allSettled(dueMonitors.map((monitor) => runMonitorCheck(monitor)));

  return {
    checked: dueMonitors.length,
    fulfilled: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length
  };
}

async function getLogs(monitorId, limit = 50) {
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId }, select: { id: true } });
  if (!monitor) {
    throw new HttpError(404, 'Monitor not found.');
  }

  return prisma.check.findMany({
    where: { monitorId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

async function getStats(monitorId) {
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId }, select: { id: true, url: true } });
  if (!monitor) {
    throw new HttpError(404, 'Monitor not found.');
  }

  const checks = await prisma.check.findMany({
    where: { monitorId },
    orderBy: { createdAt: 'desc' },
    take: LAST_CHECKS_FOR_STATS
  });

  const totalChecks = checks.length;
  const successfulChecks = checks.filter((check) => check.status === 'UP').length;
  const uptimePercentage = totalChecks ? Number(((successfulChecks / totalChecks) * 100).toFixed(2)) : null;
  const avgResponseTime = totalChecks
    ? Math.round(checks.reduce((sum, check) => sum + check.responseTime, 0) / totalChecks)
    : null;

  return {
    monitorId,
    url: monitor.url,
    uptimePercentage,
    avgResponseTime,
    totalChecks,
    successfulChecks,
    failedChecks: totalChecks - successfulChecks,
    window: `last ${LAST_CHECKS_FOR_STATS} checks`
  };
}

async function trimChecksForMonitor(monitorId) {
  if (!Number.isInteger(CHECK_RETENTION_PER_MONITOR) || CHECK_RETENTION_PER_MONITOR < 1) {
    return;
  }

  const oldChecks = await prisma.check.findMany({
    where: { monitorId },
    orderBy: { createdAt: 'desc' },
    skip: CHECK_RETENTION_PER_MONITOR,
    select: { id: true }
  });

  if (oldChecks.length === 0) {
    return;
  }

  await prisma.check.deleteMany({
    where: {
      id: { in: oldChecks.map((check) => check.id) }
    }
  });
}

module.exports = {
  getLogs,
  getStats,
  runDueChecks,
  runMonitorCheck,
  shouldRunMonitor
};
