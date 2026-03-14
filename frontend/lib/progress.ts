type ProgressSender = (currentSeconds: number, isCompleted?: boolean) => Promise<void>;

export function createProgressReporter(sender: ProgressSender, delayMs = 3000) {
  let timeoutId: number | null = null;
  let lastValue = 0;

  const flush = async (isCompleted?: boolean) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    await sender(lastValue, isCompleted);
  };

  return {
    queue(currentSeconds: number) {
      lastValue = currentSeconds;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        void flush(false);
      }, delayMs);
    },
    flush
  };
}

