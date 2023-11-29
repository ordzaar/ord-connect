/**
 * Continuously checks if the unisat extension and all related unisat APIs are ready, timing out after 2 seconds.
 *
 * @returns true if extension is ready, false otherwise
 */
export async function waitForUnisatExtensionReady() {
  let attempts = 0;
  const MAX_ATTEMPTS = 20;

  // Wait for extension to be loaded. On average, it takes 1-2 attempts. At maximum, timeout after two seconds.
  while (attempts < MAX_ATTEMPTS) {
    if (typeof window !== "undefined" && window.unisat) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const accounts = await window.unisat.getAccounts();
        // Accounts may be empty even though extension is loaded - we need to wait until this API is ready.
        return !!accounts && accounts.length > 0;
      } catch (_) {
        // If we reach here, getAccounts never existed. This should never happen.
        break;
      }
    }

    attempts += 1;
    // eslint-disable-next-line no-await-in-loop
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
  }

  return false;
}
