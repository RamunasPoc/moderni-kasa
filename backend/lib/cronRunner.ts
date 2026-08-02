let isRunning = false;

export function startBackgroundRetryQueue() {
  if (isRunning) return;
  isRunning = true;

  // Vykdyti kas 5 minutes
  setInterval(async () => {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const cronSecret = process.env.CRON_SECRET || 'default-secret';

      await fetch(`${baseUrl}/api/receipts/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('[Background Cron] Nesėkmingų kvitų siuntimo patikrinimas baigtas.');
    } catch (error) {
      console.error('[Background Cron] Klaida vykdant pakartotinį siuntimą:', error);
    }
  }, 5 * 60 * 1000); // 5 minutės
}