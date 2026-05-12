const cron = require('node-cron');
const checkService = require('../services/checkService');

let task;

function startUptimeCron() {
  if (task) {
    return task;
  }

  task = cron.schedule('* * * * *', async () => {
    try {
      const result = await checkService.runDueChecks();
      if (result.checked > 0) {
        console.log(`[pulsecheck] checked=${result.checked} ok=${result.fulfilled} failed=${result.failed}`);
      }
    } catch (error) {
      console.error('[pulsecheck] cron failed', error);
    }
  });

  return task;
}

function stopUptimeCron() {
  if (task) {
    task.stop();
    task = undefined;
  }
}

module.exports = {
  startUptimeCron,
  stopUptimeCron
};
