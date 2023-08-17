import { capitalizeFirstLetter } from "./text-helper";

export function promiseWithTimeout(promise, ms, message) {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(message);
    }, ms);
  });

  return Promise.race([promise, timeout]);
}

export function unresponsiveExtensionHandler(promise, wallet) {
  return promiseWithTimeout(
    promise,
    5000,
    `No response from ${capitalizeFirstLetter(
      wallet,
    )}. If you don't see a pop-up, you may need to reload your browser.`,
  );
}
