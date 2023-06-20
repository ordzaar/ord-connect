'use client'

import ecc from '../node_modules/ordit/js/ecc'
import bip32 from '../node_modules/ordit/js/bip32.js'
import bip39 from '../node_modules/ordit/js/bip39.js'
import buffer from '../node_modules/ordit/js/buffer.js'
import btctap from '../node_modules/ordit/js/bitcoin-tap.js'


window.bitcointp = btctap
window.ecc = ecc
window.bip32 = { BIP32Factory: bip32 }
window.bip39 = bip39
window.Buffer = buffer.Buffer

// needs to be awaited because all other imports must be assigned to window before we can import ordit-sdk
import('../node_modules/ordit/js/ordit/ordit-sdk.js').then((res => {
    window.ordit = res
    return res
}))
