"use client";

import ecc from "./ordit-sdk/ecc.js";
import bip32 from "./ordit-sdk/bip32.js";
import bip39 from "./ordit-sdk/bip39.js";
import buffer from "./ordit-sdk/buffer.js";
import btctap from "./ordit-sdk/bitcoin-tap.js";
import * as sats from "./ordit-sdk/sats.js"; // sats.js is bundled version from sats-connect

window.bitcointp = btctap;
window.ecc = ecc;
window.bip32 = { BIP32Factory: bip32 };
window.bip39 = bip39;
window.Buffer = buffer.Buffer;
window.f = 0; // Temp fix for undefined `f` error in ordit-sdk.js
window.a = 0; // Temp fix for undefined `a` error in ordit-sdk.js

// needs to be awaited because all other imports must be assigned to window before we can import ordit-sdk
import("./ordit-sdk/ordit-sdk.js").then((res) => {
  window.ordit = res;
  return res;
});
