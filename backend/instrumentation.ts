export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startBackgroundRetryQueue } = await import('@/lib/cronRunner');
    startBackgroundRetryQueue();
  }
}