function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function postCallback(
  callbackUrl: string,
  body: { verificationId: string; documentId: string; result: string },
): void {
  fetch(callbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((res) => {
    console.log(`[callback] status=${res.status} url=${callbackUrl}`);
  }).catch((err) => {
    console.error(`[callback] error url=${callbackUrl}`, err);
  });
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
