const express = require('express');
const monitorController = require('../controllers/monitorController');
const checkController = require('../controllers/checkController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/', asyncHandler(monitorController.createMonitor));
router.get('/', asyncHandler(monitorController.listMonitors));
router.patch('/:id', asyncHandler(monitorController.updateMonitor));
router.delete('/:id', asyncHandler(monitorController.deleteMonitor));
router.get('/:id/logs', asyncHandler(checkController.getLogs));
router.get('/:id/stats', asyncHandler(checkController.getStats));

module.exports = router;
