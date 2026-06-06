const MAX_REQUESTS = 100;
const WINDOW_MS = 60_000;

let count = 0;
let windowStart = Date.now();

export function tryConsume(): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) {
    count = 0;
    windowStart = now;
  }

  if (count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  count++;
  return { allowed: true };
}
