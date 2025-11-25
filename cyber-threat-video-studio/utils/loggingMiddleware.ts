export const withLogging = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  console.info(`[log] ${label} started`);
  try {
    const result = await fn();
    console.info(`[log] ${label} completed in ${Math.round(performance.now() - start)}ms`);
    return result;
  } catch (error) {
    console.error(`[log] ${label} failed`, error);
    throw error;
  }
};
