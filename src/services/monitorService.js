const prisma = require('../prisma/client');
const HttpError = require('../utils/httpError');
const { normalizeInterval, normalizeIsActive, normalizeUrl } = require('../utils/validation');

const LAST_CHECKS_FOR_UPTIME = 100;

async function createMonitor(input) {
  const url = normalizeUrl(input.url);
  const interval = normalizeInterval(input.interval);

  return prisma.monitor.create({
    data: {
      url,
      interval,
      isActive: true
    }
  });
}

async function listMonitors() {
  const monitors = await prisma.monitor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      checks: {
        orderBy: { createdAt: 'desc' },
        take: LAST_CHECKS_FOR_UPTIME,
        select: {
          status: true,
          responseTime: true,
          statusCode: true,
          createdAt: true
        }
      }
    }
  });

  return monitors.map((monitor) => {
    const totalChecks = monitor.checks.length;
    const upChecks = monitor.checks.filter((check) => check.status === 'UP').length;
    const avgResponseTime = totalChecks
      ? Math.round(monitor.checks.reduce((sum, check) => sum + check.responseTime, 0) / totalChecks)
      : null;

    return {
      id: monitor.id,
      url: monitor.url,
      interval: monitor.interval,
      isActive: monitor.isActive,
      createdAt: monitor.createdAt,
      latestCheck: monitor.checks[0] || null,
      stats: {
        uptimePercentage: totalChecks ? Number(((upChecks / totalChecks) * 100).toFixed(2)) : null,
        avgResponseTime,
        totalChecks
      }
    };
  });
}

async function getMonitorOrThrow(id) {
  const monitor = await prisma.monitor.findUnique({ where: { id } });
  if (!monitor) {
    throw new HttpError(404, 'Monitor not found.');
  }
  return monitor;
}

async function deleteMonitor(id) {
  await getMonitorOrThrow(id);
  await prisma.monitor.delete({ where: { id } });
}

async function updateMonitor(id, input) {
  await getMonitorOrThrow(id);

  const data = {};
  if (Object.prototype.hasOwnProperty.call(input, 'url')) {
    data.url = normalizeUrl(input.url);
  }
  if (Object.prototype.hasOwnProperty.call(input, 'interval')) {
    data.interval = normalizeInterval(input.interval);
  }
  if (Object.prototype.hasOwnProperty.call(input, 'isActive')) {
    data.isActive = normalizeIsActive(input.isActive);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Provide at least one field to update: url, interval, or isActive.');
  }

  return prisma.monitor.update({
    where: { id },
    data
  });
}

module.exports = {
  createMonitor,
  deleteMonitor,
  getMonitorOrThrow,
  listMonitors,
  updateMonitor
};
