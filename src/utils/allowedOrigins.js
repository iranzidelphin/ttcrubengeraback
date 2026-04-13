const defaultOrigins = [
  'http://localhost:5173',
  'https://rubengerattc.vercel.app',
  'https://*.vercel.app',
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternToRegex(pattern) {
  const normalized = pattern.trim();

  if (!normalized) {
    return null;
  }

  if (!normalized.includes('*')) {
    return new RegExp(`^${escapeRegex(normalized)}$`);
  }

  const regexPattern = normalized.split('*').map(escapeRegex).join('.*');
  return new RegExp(`^${regexPattern}$`);
}

export function getAllowedOriginPatterns() {
  const configured = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '';
  const values = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const finalValues = values.length ? values : defaultOrigins;
  return finalValues.map(patternToRegex).filter(Boolean);
}

export function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return getAllowedOriginPatterns().some((pattern) => pattern.test(origin));
}

export function createCorsOriginHandler() {
  return (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  };
}
