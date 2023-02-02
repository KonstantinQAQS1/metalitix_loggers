export const isProduction = process.env.NODE_ENV === 'production';
export const isStaging = process.env.NODE_ENV === 'staging';
export const API_ORIGIN = isProduction
  ? 'https://app.metalitix.com'
  : isStaging
  ? 'https://metalitix-staging.aircards.io'
  : 'https://metalitix-dev.aircards.io';
export const API_VERSION = 'v1';
export const API_URL = `${API_ORIGIN}/api/${API_VERSION}`;

export const MIN_INTERVAL_VALUE = 100;
export const MAX_INTERVAL_VALUE = 1000;
export const DEFAULT_INTERVAL_VALUE = 500;

export const MAXIMUM_BATCH_RECORDS_LENGTH = 20;
/** Wait maximum 3 minutes if limit of MAXIMUM_BATCH_RECORDS_LENGTH was not reached */
export const MAXIMUM_BATCH_SENDING_INTERVAL = 20 * 1000;
/** Maximum server keepalive time since last successful pull data to the server */
export const MAXIMUM_SESSION_KEEPALIVE_TIME = 5 * 60 * 1000;
/** Close session after 2 minutes of the user inactivity */
export const DEFAULT_INACTIVITY_INTERVAL = 2 * 60 * 1000;
