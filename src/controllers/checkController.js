const checkService = require('../services/checkService');
const { parsePositiveId } = require('../utils/validation');

async function getLogs(req, res) {
  const monitorId = parsePositiveId(req.params.id, 'monitor id');
  const logs = await checkService.getLogs(monitorId);
  res.json({ data: logs });
}

async function getStats(req, res) {
  const monitorId = parsePositiveId(req.params.id, 'monitor id');
  const stats = await checkService.getStats(monitorId);
  res.json({ data: stats });
}

module.exports = {
  getLogs,
  getStats
};
