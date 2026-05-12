const monitorService = require('../services/monitorService');
const { parsePositiveId } = require('../utils/validation');

async function createMonitor(req, res) {
  const monitor = await monitorService.createMonitor(req.body);
  res.status(201).json({ data: monitor });
}

async function listMonitors(req, res) {
  const monitors = await monitorService.listMonitors();
  res.json({ data: monitors });
}

async function deleteMonitor(req, res) {
  const id = parsePositiveId(req.params.id);
  await monitorService.deleteMonitor(id);
  res.status(204).send();
}

async function updateMonitor(req, res) {
  const id = parsePositiveId(req.params.id);
  const monitor = await monitorService.updateMonitor(id, req.body);
  res.json({ data: monitor });
}

module.exports = {
  createMonitor,
  deleteMonitor,
  listMonitors,
  updateMonitor
};
