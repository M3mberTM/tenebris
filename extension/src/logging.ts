const SHOULD_LOG = true;

/**
 * Logs a message if the global logging flag is set
 */
export function log(...args: any[]) {
    if (!SHOULD_LOG) return;
    console.log(...args);
}