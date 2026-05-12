const HttpError = require('./httpError');

const MAX_INTERVAL_MINUTES = 1440;

function parsePositiveId(value, label = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}.`);
  }
  return id;
}

function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'URL is required.');
  }

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new HttpError(400, 'URL must be a valid absolute URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, 'URL must use http or https.');
  }

  parsed.hash = '';
  return parsed.toString();
}

function normalizeInterval(value) {
  if (value === undefined || value === null || value === '') {
    return 1;
  }

  const interval = Number(value);
  if (!Number.isInteger(interval) || interval < 1 || interval > MAX_INTERVAL_MINUTES) {
    throw new HttpError(400, `Interval must be an integer from 1 to ${MAX_INTERVAL_MINUTES} minutes.`);
  }
  return interval;
}

function normalizeIsActive(value) {
  if (typeof value !== 'boolean') {
    throw new HttpError(400, 'isActive must be a boolean.');
  }
  return value;
}

module.exports = {
  parsePositiveId,
  normalizeUrl,
  normalizeInterval,
  normalizeIsActive
};
