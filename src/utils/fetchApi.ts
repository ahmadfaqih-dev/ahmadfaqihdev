/**
 * src/utils/fetchApi.ts
 * Reliable fetch wrapper with concurrency limits, retry, and exponential backoff.
 */

// Simple concurrency queue implementation
const concurrencyLimit = 3;
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

function acquireLock(): Promise<void> {
  return new Promise((resolve) => {
    if (activeRequests < concurrencyLimit) {
      activeRequests++;
      resolve();
    } else {
      requestQueue.push(resolve);
    }
  });
}

function releaseLock() {
  activeRequests--;
  if (requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) {
      activeRequests++;
      next();
    }
  }
}

/**
 * Fetch wrapper with retry logic and timeout handling.
 * 
 * @param url The API URL to fetch
 * @param options Fetch options (headers, etc.)
 * @param retries Number of times to retry
 * @param backoff Basic delay between retries in ms
 * @param timeout Timeout for a single request in ms
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = 3,
  backoff: number = 1000,
  timeout: number = 15000
): Promise<Response> {
  await acquireLock();

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // If response is good, return it
        if (response.ok) {
          return response;
        }

        // Only retry on 5xx server errors or rate limits (429), break on 4xx otherwise
        if (response.status < 500 && response.status !== 429) {
          console.error(`Fetch API returned ${response.status} for ${url}, aborting retry.`);
          return response; 
        }

        console.warn(`Attempt ${attempt + 1}/${retries + 1} failed for ${url} with status ${response.status}.`);
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // If it's not the last attempt, we wait and retry
        if (attempt === retries) {
          throw error;
        }

        console.warn(`Attempt ${attempt + 1}/${retries + 1} failed with error: ${error.message || error}`);
      }

      // Wait before next retry (exponential backoff)
      if (attempt < retries) {
        const delay = backoff * Math.pow(2, attempt);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error(`Max retries reached for ${url}`);
  } finally {
    releaseLock();
  }
}

export const WP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Cache-Control': 'no-cache',
};
