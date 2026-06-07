import https from 'https';
import http from 'http';
import { URL } from 'url';


function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function postCallback(
  callbackUrl: string,
  body: { verificationId: string; documentId: string; result: string },
): void {
  const payload = JSON.stringify(body);
  const url = new URL(callbackUrl);
  const isHttps = url.protocol === 'https:';
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = (isHttps ? https : http).request(options, (res) => {
    res.resume();
  });

  req.on('error', () => {
    // fire-and-forget — ignore callback failures
  });

  req.write(payload);
  req.end();
}

export function processAsync(params: {
  verificationId: string;
  documentId: string;
  callbackUrl: string;
}): string {
  const minDelay = parseInt(process.env.MIN_DELAY_MS ?? '15000', 10);
  const maxDelay = parseInt(process.env.MAX_DELAY_MS ?? '300000', 10);
  const delayMs = randomInt(minDelay, maxDelay);
  const rand = Math.random() * 100;
  const result = rand < 40 ? 'VERIFIED' : rand < 70 ? 'REJECTED' : 'INCONCLUSIVE';

  console.log(`[process] verificationId=${params.verificationId} result=${result} delay=${delayMs}ms`);

  setTimeout(() => {
    console.log(`[callback] verificationId=${params.verificationId} documentId=${params.documentId} result=${result} -> ${params.callbackUrl}`);
    postCallback(params.callbackUrl, {
      verificationId: params.verificationId,
      documentId: params.documentId,
      result,
    });
  }, delayMs);

  return result;
}
