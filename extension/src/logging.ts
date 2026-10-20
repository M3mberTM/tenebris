const SHOULD_LOG = false;

/**
 * Logs a message if the global logging flag is set
 */
export function log(...args: any[]) {
    if (!SHOULD_LOG) return;
    console.log(...args);
}