(function (exports) {
  // DEPENDENICES

  // ECC: https://github.com/sadoprotocol/ordit.io/blob/master/js/ecc.js
  // BIP32: https://github.com/sadoprotocol/ordit.io/blob/master/js/bip32.js
  // BIP39: https://github.com/sadoprotocol/ordit.io/blob/master/js/bip39.js
  // BUFFER: https://github.com/sadoprotocol/ordit.io/blob/master/js/buffer.js
  // BITCOINJS: https://github.com/sadoprotocol/ordit.io/blob/master/js/bitcoin-tap.js

  bitcointp.initEccLib(ecc); // bitcoinjs dependency requires ecc
  var bip32ecc = bip32.BIP32Factory(ecc); // bip32 dependency requires ecc

  exports.sdk = {
    config: {
      version: "0.0.0.10",
      apis: {
        mainnet: {
          batter: "https://mainnet.ordit.io/",
          orderbook: "1H4vvBnr62YWQmvNSt8Z4pDw3Vcv1n5xz7",
          formats: [
            {
              type: "p2pkh",
              name: "legacy",
              reg: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2sh",
              name: "segwit",
              reg: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2wpkh",
              name: "bech32",
              reg: /^(bc1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
            {
              type: "p2tr",
              name: "taproot",
              reg: /^(bc1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
          ],
          ipfs: "http://ipfs-gateway.ordit.io/",
        },
        regtest: {
          batter: "https://regtest.ordit.io/",
          orderbook: "bcrt1q2ys7qws8g072dqe3psp92pqz93ac6wmztexkh5",
          formats: [
            {
              type: "p2pkh",
              name: "legacy",
              reg: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2sh",
              name: "segwit",
              reg: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2wpkh",
              name: "bech32",
              reg: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
            {
              type: "p2tr",
              name: "taproot",
              reg: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
          ],
          ipfs: "http://ipfs-gateway.ordit.io/",
        },
        testnet: {
          batter: "https://testnet.ordit.io/",
          orderbook: "tb1qfnw26753j7kqu3q099sd48htvtk5wm4e0enmru",
          formats: [
            {
              type: "p2pkh",
              name: "legacy",
              reg: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2sh",
              name: "segwit",
              reg: /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            },
            {
              type: "p2wpkh",
              name: "bech32",
              reg: /^(tb1[qp]|bcrt1[qp])[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
            {
              type: "p2tr",
              name: "taproot",
              reg: /^(tb1p|bcrt1p)[a-zA-HJ-NP-Z0-9]{14,74}$/,
            },
          ],
          ipfs: "http://ipfs-gateway.ordit.io/",
        },
      },
    },
    get: function (request = false, params = {}) {
      return new Promise((resolve, reject) => {
        if (typeof ordit.sdk[request].get == "function") {
          ordit.sdk[request].get(params, function (res) {
            if (res.success) {
              resolve(res.data);
            } else {
              reject(res.message);
            }
          });
        } else {
          reject("Invalid get request");
        }
      });
    },
    sign: function (request = false, params = {}) {
      return new Promise((resolve, reject) => {
        if (typeof ordit.sdk[request].sign == "function") {
          ordit.sdk[request].sign(params, function (res) {
            if (res.success) {
              resolve(res.data);
            } else {
              reject(res.message);
            }
          });
        } else {
          reject("Invalid sign request");
        }
      });
    },
    inscribe: function (request = false, params = {}) {
      return new Promise((resolve, reject) => {
        if (typeof ordit.sdk.inscription[request] == "function") {
          ordit.sdk.inscription[request](params, function (res) {
            if (res.success) {
              resolve(res.data);
            } else {
              reject(res.message);
            }
          });
        } else {
          reject("Invalid sign request");
        }
      });
    },
    api: function (params = {}, callback = false) {
      var options = {
        uri: false,
        data: false,
        network: "testnet",
      };
      Object.assign(options, params);
      if (
        options.uri &&
        options.data &&
        options.network &&
        typeof callback == "function"
      ) {
        try {
          var uri = ordit.sdk.config.apis[options.network].batter + options.uri;
          fetch(uri, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(options.data),
          })
            .then((response) => response.json())
            .then((response) => callback(response))
            .catch((response) => callback(false));
        } catch (err) {
          callback(false, err);
        }
      }
    },
    network: function (network) {
      var chain = false;
      var net_word = network;
      if (network == "mainnet") {
        net_word = "bitcoin";
      }
      try {
        chain = bitcointp.networks[net_word];
      } catch (e) {}
      return chain;
    },
    keys: {
      get: function (params = {}, callback = false) {
        var options = {
          seed: false,
          bip39: false,
          path: false,
          format: "all",
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          (options.seed || options.bip39) &&
          options.network &&
          options.format &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message: "Invalid network for getting keys",
            data: false,
          };
          var net_obj = ordit.sdk.network(options.network);

          if (net_obj) {
            var s = false;
            var seeds = false;
            var msg = false;

            async function get_seed() {
              if (options.bip39) {
                try {
                  msg = "Invalid 24 BIP39 words";
                  s = await bip39.mnemonicToEntropy(options.bip39);
                  seeds = s.toString("hex");
                } catch (e) {}
              } else {
                try {
                  var b = bitcointp.crypto
                    .sha256(Buffer.from(options.seed), "utf8")
                    .toString("hex");
                  var m = bip39.entropyToMnemonic(
                    Buffer.from(b, "hex"),
                    bip39.wordlists.english
                  );
                  s = await bip39.mnemonicToEntropy(m);
                  seeds = s.toString("hex");
                } catch (e) {}
              }

              if (seeds) {
                var root = bip32ecc.fromSeed(
                  Buffer.from(seeds, "hex"),
                  net_obj
                );

                console.log("root", root);
                var signature = root
                  .sign(
                    bitcointp.crypto.hash256("Hello World"),
                    root.privateKey
                  )
                  .toString("base64");
                console.log("signature", signature);
                console.log(
                  "root,verify",
                  root.verify(
                    bitcointp.crypto.hash256("Hello World"),
                    Buffer.from(signature, "base64")
                  )
                );

                var chain_code = new Buffer(32);
                chain_code.fill(1);
                var root2 = bip32ecc.fromPublicKey(
                  Buffer.from(
                    "0206adb92984af8fae3b2b3e7b6411c465c31f83df615110460d54b755916f8ae0",
                    "hex"
                  ),
                  chain_code,
                  net_obj
                );
                console.log("root2", root2);

                /*
                                console.log('root2,verify', root2.verify(
                                    bitcointp.crypto.hash256('Hello World'),
                                    'JNKSO3vIxLyK7DW2BwZAhDmwslQ/1yl0iKWDh7B/YcsbT0ESMd1L1zstWTNy+9vAyZt83aQQrbZsa3VBR6kuWYE='
                                ));
                                */
                // JNKSO3vIxLyK7DW2BwZAhDmwslQ/1yl0iKWDh7B/YcsbT0ESMd1L1zstWTNy+9vAyZt83aQQrbZsa3VBR6kuWYE=

                var words = root;
                var parent = root;

                if (options.seed) {
                  words = bip39.entropyToMnemonic(
                    Buffer.from(seeds, "hex"),
                    bip39.wordlists.english
                  );
                }

                if (
                  typeof options.path == "object" &&
                  options.path.length > 0
                ) {
                  for (p = 0; p < options.path.length; p++) {
                    parent = parent.derive(parseInt(options.path[p]));
                  }
                }
                var keys = {
                  pub: Buffer.from(parent.publicKey).toString("hex"),
                  hd: parent.neutered().toBase58(),
                };

                if (options.seed) {
                  keys.bip39 = words;
                }
                results.success = true;
                results.message = "Keys attached to data";
                results.data = keys;
                callback(results);
              } else {
                results.message = "Unable to construct seed";
                if (msg) {
                  results.message += ": " + msg;
                }
                callback(results);
              }
            }
            get_seed();
          } else {
            callback(results);
          }
        }
      },
    },
    addresses: {
      format: function (address = false, network = false) {
        var format = "unknown";
        if (address && network) {
          var formats = false;
          try {
            formats = ordit.sdk.config.apis[network].formats;
          } catch (e) {}
          if (typeof formats == "object" && formats.length > 0) {
            for (f = 0; f < formats.length; f++) {
              if (formats[f].reg.test(address)) {
                format = formats[f].name;
              }
            }
          }
        }
        return format;
      },
      get: function (params = {}, callback = false) {
        var options = {
          key: false,
          seed: false,
          bip39: false,
          path: false,
          network: "testnet",
          format: "all",
        };
        Object.assign(options, params);
        if (
          (options.seed || options.key || options.bip39) &&
          options.network &&
          options.format &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message: "Invalid network for getting address",
            data: false,
          };
          var net_obj = ordit.sdk.network(options.network);

          if (net_obj) {
            var getAddresses = function (key) {
              var addresses = [];
              var chain_code = new Buffer(32);
              chain_code.fill(1);

              var childNodeXOnlyPubkey = false;

              try {
                var keys = bip32ecc.fromPublicKey(
                  Buffer.from(key, "hex"),
                  chain_code,
                  net_obj
                );
                childNodeXOnlyPubkey = keys.publicKey.slice(1, 33);
              } catch (e) {
                childNodeXOnlyPubkey = Buffer.from(key, "hex");
              }

              var error = false;

              if (
                (keys && options.format == "all") ||
                options.format == "p2pkh"
              ) {
                try {
                  var p2pkh = bitcointp.payments.p2pkh({
                    pubkey: keys.publicKey,
                    network: net_obj,
                  });
                  addresses.push({
                    address: p2pkh.address,
                    format: "legacy",
                    pub: keys.publicKey.toString("hex"),
                  });
                } catch (e) {
                  error = e;
                }
              }
              if (
                (keys && options.format == "all") ||
                options.format == "p2sh"
              ) {
                try {
                  var p2sh = bitcointp.payments.p2sh({
                    redeem: bitcointp.payments.p2wpkh({
                      pubkey: keys.publicKey,
                      network: net_obj,
                    }),
                    network: net_obj,
                  });
                  addresses.push({
                    address: p2sh.address,
                    format: "segwit",
                    pub: keys.publicKey.toString("hex"),
                  });
                } catch (e) {
                  error = e;
                }
              }
              if (
                (keys && options.format == "all") ||
                options.format == "p2wpkh"
              ) {
                try {
                  var p2wpkh = bitcointp.payments.p2wpkh({
                    pubkey: keys.publicKey,
                    network: net_obj,
                  });
                  addresses.push({
                    address: p2wpkh.address,
                    format: "bech32",
                    pub: keys.publicKey.toString("hex"),
                  });
                } catch (e) {
                  error = e;
                }
              }
              if (
                (childNodeXOnlyPubkey && options.format == "all") ||
                options.format == "p2tr"
              ) {
                try {
                  var p2tr = bitcointp.payments.p2tr({
                    internalPubkey: childNodeXOnlyPubkey,
                    network: net_obj,
                  });
                  addresses.push({
                    address: p2tr.address,
                    xkey: childNodeXOnlyPubkey.toString("hex"),
                    format: "taproot",
                    pub: keys.publicKey.toString("hex"),
                  });
                } catch (e) {
                  error = e;
                }
              }
              if (addresses.length > 0) {
                results.success = true;
                results.message = "Addresses attached to data";
                results.data = addresses;
                callback(results);
              } else {
                results.message = "Invalid address format";
                if (error) {
                  results.message += "<hr><code>" + error + "</code>";
                }
                callback(results);
              }
            };

            if (options.seed || options.bip39) {
              ordit.sdk.keys.get(options, function (k) {
                if (k.success) {
                  getAddresses(k.data.pub);
                } else {
                  results.message = k.message;
                  callback(results);
                }
              });
            } else {
              getAddresses(options.key);
            }
          } else {
            callback(results);
          }
        }
      },
    },
    wallet: {
      get: function (params = {}, callback = false) {
        var options = {
          key: false,
          seed: false,
          connect: false,
          bip39: false,
          path: false,
          network: "testnet",
          format: "all",
        };
        Object.assign(options, params);
        if (
          (options.seed || options.key || options.connect || options.bip39) &&
          options.network &&
          options.format &&
          typeof callback == "function" &&
          // be sure only one of the four inputs is used ...

          !(options.seed && options.key && options.bip39 && options.connect) &&
          !(options.key && options.bip39 && options.connect) &&
          !(options.seed && options.key && options.connect) &&
          !(options.seed && options.key && options.bip39) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.key && options.connect) &&
          !(options.seed && options.bip39) &&
          !(options.key && options.bip39) &&
          !(options.seed && options.key)
        ) {
          var results = {
            success: false,
            message: "Unable to get addresses",
            data: false,
          };

          var get_addresses = function (opt, keys, specified_address = false) {
            if (opt.connect) {
              var wallet = {
                counts: {
                  addresses: keys.length,
                },
                keys: keys,
                addresses: keys,
              };
              results.success = true;
              results.message = "Wallet attached to data";
              results.data = wallet;
              callback(results);
            } else {
              ordit.sdk.addresses.get(opt, function (a) {
                if (a.success) {
                  var addresses = a.data;
                  if (specified_address) {
                    new_addresses = [];
                    for (a = 0; a < addresses.length; a++) {
                      if (addresses[a].address == specified_address) {
                        new_addresses.push(addresses[a]);
                      }
                    }
                    addresses = JSON.parse(JSON.stringify(new_addresses));
                  }
                  var wallet = {
                    counts: {
                      addresses: addresses.length,
                    },
                    keys: keys,
                    addresses: addresses,
                  };
                  results.success = true;
                  results.message = "Wallet attached to data";
                  results.data = wallet;
                  callback(results);
                } else {
                  results.message = a.message;
                  callback(results);
                }
              });
            }
          };
          if (options.seed || options.bip39) {
            ordit.sdk.keys.get(options, function (k) {
              if (k.success) {
                var keys = k.data;
                options.seed = false;
                options.key = keys.pub;
                get_addresses(options, [keys]);
              } else {
                results.message = k.message;
                callback(results);
              }
            });
          } else if (options.connect) {
            ordit.sdk.connect.key(options, function (k) {
              if (k.success) {
                var keys = k.data;
                var address = false;
                options.seed = false;
                options.key = keys.pub;
                if (typeof keys.address) {
                  address = keys.address;
                }
                get_addresses(options, keys, address);
              } else {
                results.message = k.message;
                callback(results);
              }
            });
          } else {
            get_addresses(options, [{ pub: options.key }]);
          }
        } else if (typeof callback == "function") {
          callback({
            success: false,
            message: "Invalid options for wallet.get function",
            data: false,
          });
        }
      },
    },
    balance: {
      get: function (params = {}, callback = false) {
        var options = {
          key: false,
          seed: false,
          connect: false,
          bip39: false,
          path: false,
          network: "testnet",
          format: "all",
        };
        Object.assign(options, params);
        if (
          (options.seed || options.key || options.connect || options.bip39) &&
          options.network &&
          options.format &&
          typeof callback == "function" &&
          // be sure only one of the four inputs is used ...

          !(options.seed && options.key && options.bip39 && options.connect) &&
          !(options.key && options.bip39 && options.connect) &&
          !(options.seed && options.key && options.connect) &&
          !(options.seed && options.key && options.bip39) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.key && options.connect) &&
          !(options.seed && options.bip39) &&
          !(options.key && options.bip39) &&
          !(options.seed && options.key)
        ) {
          var results = {
            success: false,
            message: "Unable to get wallet",
            data: false,
          };
          ordit.sdk.wallet.get(options, function (w) {
            if (w.success) {
              var ordinals = [];
              var inscriptions = [];
              var spendables = [];
              var unspendables = [];
              var wallet = w.data;
              if (typeof wallet.counts != "object") {
                wallet.counts = {
                  addresses: wallet.addresses.length,
                };
              }
              wallet.counts.unspents = 0;
              wallet.counts.satoshis = 0;
              wallet.counts.cardinals = 0;
              wallet.counts.spendables = 0;
              wallet.counts.unspendables = 0;
              wallet.counts.ordinals = 0;
              wallet.counts.inscriptions = 0;

              var completed = 0;

              jQuery.each(wallet.addresses, function (i) {
                var address = wallet.addresses[i].address;
                var wallet_unspents = 0;
                var wallet_satoshis = 0;
                var wallet_cardinals = 0;
                var wallet_spendables = 0;
                var wallet_unspendables = 0;

                ordit.sdk.api(
                  {
                    uri: "utxo/unspents",
                    data: {
                      address: address,
                      options: {
                        txhex: true,
                        notsafetospend: false,
                        allowedrarity: ["common"],
                      },
                    },
                    network: options.network,
                  },
                  function (unspent) {
                    if (unspent.success) {
                      wallet.addresses[i].unspents = unspent.rdata;
                    }
                    wallet.counts.unspents +=
                      wallet.addresses[i].unspents.length;
                    wallet_unspents += wallet.addresses[i].unspents.length;
                    for (u = 0; u < wallet.addresses[i].unspents.length; u++) {
                      wallet.addresses[i].unspents[u].pub =
                        wallet.addresses[i].pub;
                      var un = wallet.addresses[i].unspents[u];
                      wallet.counts.satoshis += un.sats;
                      wallet_satoshis += un.sats;
                      if (un.safeToSpend) {
                        wallet.counts.cardinals += un.sats;
                        wallet_cardinals += un.sats;
                        wallet.counts.spendables++;
                        wallet_spendables++;
                        spendables.push(un);
                      } else {
                        wallet.counts.unspendables++;
                        wallet_unspendables++;
                        unspendables.push(un);
                      }

                      var ord = un.ordinals;
                      var ins = un.inscriptions;

                      for (od = 0; od < ord.length; od++) {
                        ord[od].address = address;
                        ord[od].unspent = un.txid;
                        ordinals.push(ord[od]);
                      }
                      for (is = 0; is < ins.length; is++) {
                        ins[is].address = address;
                        ins[is].unspent = un.txid;
                        inscriptions.push(ins[is]);
                      }
                    }
                    wallet.spendables = spendables;
                    wallet.unspendables = unspendables;
                    wallet.ordinals = ordinals;
                    wallet.inscriptions = inscriptions;
                    wallet.counts.ordinals = ordinals.length;
                    wallet.counts.inscriptions = inscriptions.length;

                    wallet.addresses[i].counts = {
                      unspents: wallet_unspents,
                      satoshis: wallet_satoshis,
                      cardinals: wallet_cardinals,
                      spendables: wallet_spendables,
                      unspendables: wallet_unspendables,
                    };

                    // ++
                    completed++;
                    if (completed == wallet.addresses.length) {
                      results.success = true;
                      results.message = "Wallet lookup attached to data";
                      results.data = wallet;
                      callback(results);
                    }
                  }
                );
              });
            } else {
              callback(results);
            }
          });
        } else if (typeof callback == "function") {
          callback({
            success: false,
            message: "Invalid options for balance.get function",
            data: false,
          });
        }
      },
    },
    psbt: {
      get: function (params = {}, callback = false) {
        var options = {
          key: false,
          seed: false,
          bip39: false,
          connect: false,
          path: false,
          network: "testnet",
          format: "all",
          ins: [],
          outs: [],
        };
        Object.assign(options, params);
        if (
          (options.seed || options.key || options.bip39 || options.connect) &&
          options.network &&
          options.format &&
          typeof callback == "function" &&
          typeof options.ins == "object" &&
          options.ins.length > 0 &&
          typeof options.outs == "object" &&
          options.outs.length > 0 &&
          // be sure only one of the four inputs is used ...

          !(options.seed && options.key && options.bip39 && options.connect) &&
          !(options.key && options.bip39 && options.connect) &&
          !(options.seed && options.key && options.connect) &&
          !(options.seed && options.key && options.bip39) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.key && options.connect) &&
          !(options.seed && options.bip39) &&
          !(options.key && options.bip39) &&
          !(options.seed && options.key)
        ) {
          var results = {
            success: false,
            message: "Unable to construct transaction",
            data: false,
          };

          ordit.sdk.balance.get(options, function (w) {
            var net_obj = ordit.sdk.network(options.network);

            if (w.success && net_obj) {
              var wallet = w.data;

              var fees = 0;
              var change = 0;
              var dust = 600;
              var inputs_used = 0;
              var sats_per_byte = 10;
              var total_cardinals_to_send = 0;
              var total_cardinals_available = 0;
              var unsupported_inputs = [];
              var unspents_to_use = [];
              var xverse_inputs = [];

              var psbt = new bitcointp.Psbt({ network: net_obj });

              for (o = 0; o < options.outs.length; o++) {
                try {
                  if (typeof options.outs[o].cardinals != "undefined") {
                    total_cardinals_to_send += parseInt(
                      options.outs[o].cardinals
                    );
                    psbt.addOutput({
                      address: options.outs[o].address,
                      value: parseInt(options.outs[o].cardinals),
                    });
                  }
                } catch (output_error) {
                  console.info("output_error", output_error);
                }
              }

              for (i = 0; i < options.ins.length; i++) {
                if (typeof options.ins[i].address != "undefined") {
                  for (ws = 0; ws < wallet.spendables.length; ws++) {
                    var sats = wallet.spendables[ws].sats;
                    var a = wallet.spendables[ws].scriptPubKey.address;
                    fees = JSON.parse(
                      JSON.stringify(
                        (80 + (inputs_used + 1) * 180) * sats_per_byte
                      )
                    );

                    if (
                      (a == options.ins[i].address ||
                        options.ins[i].address == "any") &&
                      total_cardinals_available <=
                        total_cardinals_to_send + fees
                    ) {
                      var error = false;
                      var supported = false;
                      var spendable = wallet.spendables[ws];
                      var t = spendable.scriptPubKey.type;

                      if (options.ins[i].address == "any") {
                        options.ins[i].address = a;
                      }

                      if (t == "witness_v1_taproot") {
                        try {
                          var childNodeXOnlyPubkey = false;

                          try {
                            var chain_code = new Buffer(32);
                            chain_code.fill(1);
                            var pkey = bip32ecc.fromPublicKey(
                              Buffer.from(spendable.pub, "hex"),
                              chain_code,
                              net_obj
                            );
                            childNodeXOnlyPubkey = pkey.publicKey.slice(1, 33);
                          } catch (e) {
                            childNodeXOnlyPubkey = Buffer.from(
                              spendable.pub,
                              "hex"
                            );
                          }

                          var p2tr = bitcointp.payments.p2tr({
                            internalPubkey: childNodeXOnlyPubkey,
                            network: net_obj,
                          });
                          psbt.addInput({
                            hash: spendable.txid,
                            index: parseInt(spendable.n),
                            tapInternalKey: childNodeXOnlyPubkey,
                            witnessUtxo: {
                              script: p2tr.output,
                              value: parseInt(spendable.sats),
                            },
                          });
                          supported = true;
                        } catch (e) {
                          error = e;
                        }
                      } else if (t == "witness_v0_keyhash") {
                        try {
                          var p = bitcointp.payments.p2wpkh({
                            pubkey: Buffer.from(spendable.pub, "hex"),
                            network: net_obj,
                          });
                          psbt.addInput({
                            hash: spendable.txid,
                            index: parseInt(spendable.n),
                            witnessUtxo: {
                              script: p.output,
                              value: parseInt(spendable.sats),
                            },
                          });
                          supported = true;
                        } catch (e) {
                          error = e;
                        }
                      } else if (t == "scripthash") {
                        try {
                          var p2sh = bitcointp.payments.p2sh({
                            redeem: bitcointp.payments.p2wpkh({
                              pubkey: Buffer.from(spendable.pub, "hex"),
                              network: net_obj,
                            }),
                            network: net_obj,
                          });
                          psbt.addInput({
                            hash: spendable.txid,
                            index: parseInt(spendable.n),
                            redeemScript: p2sh.redeem.output,
                            witnessUtxo: {
                              script: p2sh.output,
                              value: parseInt(spendable.sats),
                            },
                          });
                          supported = true;
                        } catch (e) {
                          error = e;
                        }
                      } else if (t == "pubkeyhash") {
                        try {
                          psbt.addInput({
                            hash: spendable.txid,
                            index: parseInt(spendable.n),
                            nonWitnessUtxo: Buffer.from(spendable.txhex, "hex"),
                          });
                          supported = true;
                        } catch (e) {
                          error = e;
                        }
                      } else {
                        error = "Unsupported input type";
                      }
                      if (supported) {
                        unspents_to_use.push(wallet.spendables[ws]);
                        total_cardinals_available += sats;
                        xverse_inputs.push({
                          address: a,
                          signingIndexes: [inputs_used],
                        });
                        inputs_used++;
                      } else {
                        wallet.spendables[ws].error = error;
                        unsupported_inputs.push(wallet.spendables[ws]);
                      }
                    }
                  }
                }
              }

              change =
                total_cardinals_available - (total_cardinals_to_send + fees);

              if (unsupported_inputs.length > 0) {
                console.info("unsupported_inputs", unsupported_inputs);
              }

              if (unspents_to_use.length > 0 && change >= 0) {
                if (change >= dust) {
                  psbt.addOutput({
                    address: options.ins[0].address,
                    value: change,
                  });
                }
                var psbt_hex = psbt.toHex();
                var psbt_base64 = psbt.toBase64();

                results.success = true;
                results.message = "Unsigned PSBT formats attached to data";
                results.data = {
                  hex: psbt_hex,
                  base64: psbt_base64,
                };

                if (options.connect == "xverse") {
                  results.data.inputs = xverse_inputs;
                }

                callback(results);
              } else {
                results.message =
                  "Not enough input value to cover outputs and fees. Total cardinals available: " +
                  total_cardinals_available +
                  ". Cardinals to send: " +
                  total_cardinals_to_send +
                  ". Estimated fees: " +
                  fees +
                  ".";
                callback(results);
              }
            } else {
              results.message = w.message;
              callback(results);
            }
          });
        } else if (typeof callback == "function") {
          callback({
            success: false,
            message: "Invalid options for tx.get function",
            data: false,
          });
        }
      },
      sign: function (params = {}, callback = false) {
        var options = {
          seed: false,
          bip39: false,
          connect: false,
          path: false,
          hex: false,
          base64: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          (options.hex || options.base64) &&
          (options.seed || options.bip39 || options.connect) &&
          options.network &&
          typeof callback == "function" &&
          !(options.hex && options.base64) &&
          // be sure only one of the three inputs is used ...

          !(options.seed && options.bip39 && options.connect) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.seed && options.bip39)
        ) {
          var results = {
            success: false,
            message: "Unable to reconstruct PSBT",
            data: false,
          };
          var error = false;
          var psbt = false;

          if (options.hex) {
            try {
              psbt = bitcointp.Psbt.fromHex(options.hex);
            } catch (err) {
              error = err;
            }
          } else {
            if (!psbt) {
              try {
                psbt = bitcointp.Psbt.fromBase64(options.base64);
              } catch (err) {
                error = err;
              }
            }
          }
          if (psbt) {
            if (options.seed || options.bip39) {
              var net_obj = ordit.sdk.network(options.network);

              // TODO - re-construct private keys and sign ???

              async function get_keys() {
                if (options.bip39) {
                  s = await bip39.mnemonicToEntropy(options.bip39);
                  seeds = s.toString("hex");
                } else {
                  try {
                    var b = bitcointp.crypto
                      .sha256(Buffer.from(options.seed), "utf8")
                      .toString("hex");
                    var m = bip39.entropyToMnemonic(
                      Buffer.from(b, "hex"),
                      bip39.wordlists.english
                    );
                    s = await bip39.mnemonicToEntropy(m);
                    seeds = s.toString("hex");
                  } catch (e) {}
                }

                var root = bip32ecc.fromSeed(
                  Buffer.from(seeds, "hex"),
                  net_obj
                );

                var parent = root;

                if (
                  typeof options.path == "object" &&
                  options.path.length > 0
                ) {
                  for (p = 0; p < options.path.length; p++) {
                    parent = parent.derive(parseInt(options.path[p]));
                  }
                }
                var keys = {
                  pub: Buffer.from(parent.publicKey).toString("hex"),
                  priv: Buffer.from(parent.privateKey).toString("hex"),
                  wif: parent.toWIF(),
                  parent: parent,
                };

                return keys;
              }
              get_keys().then(async (full_keys) => {
                if (
                  typeof psbt == "object" &&
                  typeof psbt.inputCount != "undefined" &&
                  psbt.inputCount > 0
                ) {
                  var error = false;

                  for (i = 0; i < psbt.inputCount; i++) {
                    try {
                      psbt.signInput(i, full_keys.parent);
                    } catch (e) {
                      error = e;
                    }
                  }

                  if (error) {
                    results.message =
                      "Error signing:<hr><code>" + error + "</code>";
                    callback(results);
                  } else {
                    var psbt_hex = psbt.toHex();
                    var psbt_base64 = psbt.toBase64();

                    if (
                      (options.hex && options.hex != psbt_hex) ||
                      (options.base64 && options.base64 != psbt_base64)
                    ) {
                      results.success = true;
                      results.message = "Signed PSBT attached to data";
                      var hex = false;
                      var psbt_data = false;
                      try {
                        psbt.finalizeAllInputs();
                        hex = psbt.extractTransaction().toHex();
                        results.message =
                          "Finalized raw TX hex attached to data";
                      } catch (e) {
                        psbt_data = {
                          hex: psbt_hex,
                          base64: psbt_base64,
                        };
                      }
                      var signed_response = {
                        hex: hex,
                        psbt: psbt_data,
                      };
                      results.data = signed_response;
                      callback(results);
                    } else {
                      results.message = "Signed PSBT same as input PSBT";
                      callback(results);
                    }
                  }
                } else {
                  results.message = "Unable to count inputs";
                  callback(results);
                }
              });
            } else if (options.connect) {
              options.psbt = psbt;
              ordit.sdk.connect.sign(options, function (s) {
                callback(s);
              });
            }
          } else {
            if (error) {
              results.message += ": " + error;
            }
            callback(results);
          }
        } else if (typeof callback == "function") {
          callback({
            success: false,
            message: "Invalid options for signature.get function",
            data: false,
          });
        }
      },
    },
    txid: {
      get: function (params = {}, callback = false) {
        var options = {
          hex: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (options.hex && options.network && typeof callback == "function") {
          var results = {
            success: false,
            message: "Unable to relay transaction",
            data: false,
          };
          ordit.sdk.api(
            {
              uri: "utxo/relay",
              data: { hex: options.hex },
              network: options.network,
            },
            function (response) {
              if (
                typeof response == "object" &&
                typeof response.success != "undefined" &&
                response.success === true &&
                typeof response.rdata != "undefined" &&
                response.rdata
              ) {
                var txid = response.rdata;
                results.success = true;
                results.message = "Transaction ID attached to data";
                results.data = {
                  txid: txid,
                };
              } else {
                if (response.message) {
                  results.message += ": " + response.message;
                }
              }
              callback(results);
            }
          );
        } else if (typeof callback == "function") {
          callback({
            success: false,
            message: "Invalid options for txid.get function",
            data: false,
          });
        }
      },
    },
    message: {
      sign: function (params = {}, callback = false) {
        var options = {
          seed: false,
          bip39: false,
          connect: false,
          path: false,
          message: false,
          format: "core",
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          (options.seed || options.bip39 || options.connect) &&
          options.network &&
          options.message &&
          options.format &&
          typeof callback == "function" &&
          options.format == "core" &&
          // be sure only one of the three inputs is used ...

          !(options.seed && options.bip39 && options.connect) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.seed && options.bip39)
        ) {
          var results = {
            data: false,
            success: false,
            message: "Invalid options for signature",
          };

          if (options.seed || options.bip39) {
            var net_obj = ordit.sdk.network(options.network);

            async function get_keys() {
              if (options.bip39) {
                s = await bip39.mnemonicToEntropy(options.bip39);
                seeds = s.toString("hex");
              } else {
                try {
                  var b = bitcointp.crypto
                    .sha256(Buffer.from(options.seed), "utf8")
                    .toString("hex");
                  var m = bip39.entropyToMnemonic(
                    Buffer.from(b, "hex"),
                    bip39.wordlists.english
                  );
                  s = await bip39.mnemonicToEntropy(m);
                  seeds = s.toString("hex");
                } catch (e) {}
              }

              var root = bip32ecc.fromSeed(Buffer.from(seeds, "hex"), net_obj);

              var parent = root;

              if (typeof options.path == "object" && options.path.length > 0) {
                for (p = 0; p < options.path.length; p++) {
                  parent = parent.derive(parseInt(options.path[p]));
                }
              }
              var keys = {
                pub: Buffer.from(parent.publicKey).toString("hex"),
                priv: Buffer.from(parent.privateKey).toString("hex"),
                wif: parent.toWIF(),
                parent: parent,
              };

              return keys;
            }
            get_keys().then(async (full_keys) => {
              var error = false;
              var signature = false;
              var signing_address = false;

              try {
                var chain_id = options.network;
                if (options.network == "mainnet") chain_id = "bitcoin";
                else chain_id = "bitcointestnet";
                var blockchain = bitcoin.networks[chain_id];
                var message_key = bitcoin.ECKey.fromWIF(full_keys.wif);
                signing_address = message_key.pub.getAddress(blockchain);
                signature = bitcoin.Message.sign(
                  message_key,
                  options.message,
                  blockchain
                );
              } catch (e) {
                error = e;
              }

              if (signature) {
                results.success = true;
                results.message = "Signature attached to data";
                results.data = {
                  hex: signature.toString("hex"),
                  base64: signature.toString("base64"),
                  address: signing_address.toString("hex"),
                };
                callback(results);
              } else {
                results.message =
                  "Unable to sign message:<hr><code>" + error + "</code>";
                callback(results);
              }
            });
          } else {
            ordit.sdk.connect.message(options, function (s) {
              if (s.success) {
                var signatures = s.data;
                results.success = true;
                results.message = "Signatures attached to data";
                results.data = signatures;
              } else {
                results.message = s.message;
              }
              callback(results);
            });
          }
        }
      },
      verify: function (params = {}, callback = false) {
        var options = {
          address: false,
          message: false,
          signature: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          options.address &&
          options.message &&
          options.signature &&
          options.network &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            data: false,
            message: "Unable to verify message",
          };
          var error = false;
          var verified = false;
          try {
            var chain_id = options.network;
            if (options.network == "mainnet") chain_id = "bitcoin";
            else chain_id = "bitcointestnet";
            var blockchain = bitcoin.networks[chain_id];
            verified = bitcoin.Message.verify(
              options.address,
              options.signature,
              options.message,
              blockchain
            );
          } catch (e) {
            error = e;
          }

          if (error) {
            results.message = error.message;
          } else {
            results.success = true;
            results.message = "Verification attached to data";
            results.data = {
              verified: verified,
            };
          }
          callback(results);
        } else if (typeof callbaclk == "function") {
          callback({
            data: false,
            success: false,
            message: "Invalid options for message veriofy",
          });
        }
      },
    },
    connect: {
      supported: function (wallet = false, network = false) {
        var supported = false;
        if (
          ((wallet == "unisat" || wallet == "xverse") &&
            (network == "mainnet" || network == "testnet")) ||
          wallet == "metamask"
        ) {
          supported = true;
        }
        return supported;
      },
      key: function (params = {}, callback = false) {
        var options = {
          connect: false,
          network: "testnet",
          format: "all",
        };
        Object.assign(options, params);
        if (
          options.connect &&
          options.network &&
          options.format &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message:
              "The " +
              options.connect +
              " wallet cannot support get on  " +
              options.network,
            data: false,
          };
          if (
            ordit.sdk.connect.supported(options.connect, options.network) &&
            typeof ordit.sdk[options.connect] == "object" &&
            typeof ordit.sdk[options.connect].key == "function"
          ) {
            ordit.sdk[options.connect].key(options, function (k) {
              if (k.success) {
                callback(k);
              } else {
                results.message = k.message;
                callback(results);
              }
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for connect.key",
              data: false,
            });
          }
        }
      },
      message: function (params = {}, callback = false) {
        var options = {
          connect: false,
          message: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          options.connect &&
          options.network &&
          options.message &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message:
              "The " +
              options.connect +
              " wallet cannot support message signing on " +
              options.network,
            data: false,
          };
          if (
            ordit.sdk.connect.supported(options.connect, options.network) &&
            typeof ordit.sdk[options.connect] == "object" &&
            typeof ordit.sdk[options.connect].message == "function"
          ) {
            ordit.sdk[options.connect].message(options, function (s) {
              if (s.success) {
                callback(s);
              } else {
                results.message = s.message;
                callback(results);
              }
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for connect.sign",
              data: false,
            });
          }
        }
      },
      sign: function (params = {}, callback = false) {
        var options = {
          connect: false,
          psbt: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          options.connect &&
          options.network &&
          typeof options.psbt == "object" &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message:
              "The " +
              options.connect +
              " wallet cannot support sign on  " +
              options.network,
            data: false,
          };
          if (
            ordit.sdk.connect.supported(options.connect, options.network) &&
            typeof ordit.sdk[options.connect] == "object" &&
            typeof ordit.sdk[options.connect].sign == "function"
          ) {
            ordit.sdk[options.connect].sign(options, function (s) {
              if (s.success) {
                callback(s);
              } else {
                results.message = s.message;
                callback(results);
              }
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for connect.sign",
              data: false,
            });
          }
        }
      },
    },
    metamask: {
      key: function (params = {}, callback = false) {
        var options = {
          path: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (options.network && typeof callback == "function") {
          var results = {
            success: false,
            message: "Metamask not installed",
            data: false,
          };
          if (typeof window.MetaMaskSDK != "undefined") {
            var MMSDK = new MetaMaskSDK.MetaMaskSDK();
            var ethereum = MMSDK.getProvider(); // You can also access via window.ethereum

            async function get_accounts() {
              return await ethereum.request({ method: "eth_requestAccounts" });
            }
            get_accounts().then(async (accounts) => {
              var address = accounts[0];
              var msg = "Generate Bitcoin Addresses from " + address + "?";
              var signature = await ethereum.request({
                method: "personal_sign",
                params: [msg, address],
              });
              var wallet_options = {
                seed: signature,
                path: options.path,
                network: options.network,
                format: "all",
              };
              ordit.sdk.wallet.get(wallet_options, function (w) {
                if (w.success) {
                  results.success = true;
                  results.message = "Key attached to data";
                  results.data = w.data.addresses;
                } else {
                  results.message = w.message;
                }
                callback(results);
              });
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for metamask.key",
              data: false,
            });
          }
        }
      },
      sign: function (params = {}, callback = false) {
        var options = {
          psbt: false,
        };
        Object.assign(options, params);
        if (typeof options.psbt == "object" && typeof callback == "function") {
          var results = {
            success: false,
            message: "Metamask not installed for signing",
            data: false,
          };

          if (typeof window.MetaMaskSDK != "undefined") {
            var MMSDK = new MetaMaskSDK.MetaMaskSDK();
            var ethereum = MMSDK.getProvider(); // You can also access via window.ethereum

            var net_obj = ordit.sdk.network(options.network);

            var psbt = options.psbt;

            async function get_accounts() {
              return await ethereum.request({ method: "eth_requestAccounts" });
            }
            get_accounts().then(async (accounts) => {
              var address = accounts[0];
              var msg = "Generate Bitcoin Addresses from " + address + "?";
              var signature = await ethereum.request({
                method: "personal_sign",
                params: [msg, address],
              });

              async function get_keys() {
                var s = false;
                var seeds = false;

                try {
                  var b = bitcointp.crypto
                    .sha256(Buffer.from(signature), "utf8")
                    .toString("hex");
                  var m = bip39.entropyToMnemonic(
                    Buffer.from(b, "hex"),
                    bip39.wordlists.english
                  );
                  s = await bip39.mnemonicToEntropy(m);
                  seeds = s.toString("hex");
                } catch (e) {}

                var root = bip32ecc.fromSeed(
                  Buffer.from(seeds, "hex"),
                  net_obj
                );

                var parent = root;

                if (
                  typeof options.path == "object" &&
                  options.path.length > 0
                ) {
                  for (p = 0; p < options.path.length; p++) {
                    parent = parent.derive(parseInt(options.path[p]));
                  }
                }
                var keys = {
                  pub: Buffer.from(parent.publicKey).toString("hex"),
                  priv: Buffer.from(parent.privateKey).toString("hex"),
                  wif: parent.toWIF(),
                  parent: parent,
                };

                return keys;
              }
              get_keys().then(async (full_keys) => {
                if (
                  typeof psbt == "object" &&
                  typeof psbt.inputCount != "undefined" &&
                  psbt.inputCount > 0
                ) {
                  var error = false;

                  for (i = 0; i < psbt.inputCount; i++) {
                    try {
                      psbt.signInput(i, full_keys.parent);
                    } catch (e) {
                      error = e;
                    }
                  }

                  if (error) {
                    results.message =
                      "Error signing:<hr><code>" + error + "</code>";
                    callback(results);
                  } else {
                    var psbt_hex = psbt.toHex();
                    var psbt_base64 = psbt.toBase64();

                    if (
                      (options.hex && options.hex != psbt_hex) ||
                      (options.base64 && options.base64 != psbt_base64)
                    ) {
                      results.success = true;
                      results.message = "Signed PSBT attached to data";
                      var hex = false;
                      var psbt_data = false;
                      try {
                        psbt.finalizeAllInputs();
                        hex = psbt.extractTransaction().toHex();
                        results.message =
                          "Finalized raw TX hex attached to data";
                      } catch (e) {
                        psbt_data = {
                          hex: psbt_hex,
                          base64: psbt_base64,
                        };
                      }
                      var signed_response = {
                        hex: hex,
                        psbt: psbt_data,
                      };
                      results.data = signed_response;
                      callback(results);
                    } else {
                      results.message = "Signed PSBT same as input PSBT";
                      callback(results);
                    }
                  }
                } else {
                  results.message = "Unable to count inputs";
                  callback(results);
                }
              });
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for unisat.sign",
              data: false,
            });
          }
        }
      },
      message: function (params = {}, callback = false) {
        var options = {
          connect: false,
          message: false,
          network: "testnet",
        };
        Object.assign(options, params);
        if (
          options.connect == "metamask" &&
          options.network &&
          options.message &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message: "The metamask wallet cannot support message signing",
            data: false,
          };

          if (typeof window.MetaMaskSDK != "undefined") {
            var MMSDK = new MetaMaskSDK.MetaMaskSDK();
            var ethereum = MMSDK.getProvider(); // You can also access via window.ethereum

            async function get_accounts() {
              return await ethereum.request({ method: "eth_requestAccounts" });
            }
            get_accounts().then(async (accounts) => {
              var address = accounts[0];
              var msg = "Generate Bitcoin Addresses from " + address + "?";
              var signature = await ethereum.request({
                method: "personal_sign",
                params: [msg, address],
              });

              async function get_keys() {
                var s = false;
                var seeds = false;

                try {
                  var b = bitcointp.crypto
                    .sha256(Buffer.from(signature), "utf8")
                    .toString("hex");
                  var m = bip39.entropyToMnemonic(
                    Buffer.from(b, "hex"),
                    bip39.wordlists.english
                  );
                  s = await bip39.mnemonicToEntropy(m);
                  seeds = s.toString("hex");
                } catch (e) {}

                options.connect = false;
                options.seed = seeds;
                ordit.sdk.message.sign(options, function (signed) {
                  callback(signed);
                });
              }
              get_keys();
            });
          } else {
            results.message = "Metamask not installed for messages";
          }
        } else if (typeof callback == "function") {
          callback({
            data: false,
            success: false,
            message: "Invalid options for metamask.message",
          });
        }
      },
    },
    unisat: {
      key: function (params = {}, callback = false) {
        var options = {
          network: false,
        };
        Object.assign(options, params);
        if (options.network && typeof callback == "function") {
          var results = {
            success: false,
            message: "Unisat not installed",
            data: false,
          };
          if (typeof window.unisat != "undefined") {
            var uninet = false;
            async function getnet() {
              uninet = await window.unisat.getNetwork();
              var unisatnet = "livenet";
              if (options.network == "testnet") {
                unisatnet = options.network;
              }
              if (uninet != unisatnet) {
                await window.unisat.switchNetwork(unisatnet);
              }
            }
            getnet().then(() => {
              var address = false;
              var public_key = false;
              async function connect() {
                let accounts = await window.unisat.requestAccounts();
                if (typeof accounts == "object" && accounts.length > 0) {
                  address = accounts[0];
                }
              }
              connect().then(async () => {
                public_key = await window.unisat.getPublicKey();
                results.success = true;
                results.message = "Key attached to data";
                results.data = [
                  {
                    pub: public_key,
                    address: address,
                    format: ordit.sdk.addresses.format(
                      address,
                      options.network
                    ),
                  },
                ];
                callback(results);
              });
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for unisat.key",
              data: false,
            });
          }
        }
      },
      sign: function (params = {}, callback = false) {
        var options = {
          psbt: false,
        };
        Object.assign(options, params);
        if (typeof options.psbt == "object" && typeof callback == "function") {
          var results = {
            success: false,
            message: "Unisat not installed for signing",
            data: false,
          };
          if (typeof window.unisat != "undefined") {
            var psbt = options.psbt;
            var psbt_hex = psbt.toHex();
            async function sign() {
              return await window.unisat.signPsbt(psbt_hex);
            }
            sign().then(async (signed_tx) => {
              if (signed_tx) {
                var final_psbt = bitcointp.Psbt.fromHex(signed_tx);

                var data = {
                  hex: false,
                  psbt: false,
                };
                var final_hex = false;
                var msg = "Unfinalized PSBT attached to data";

                try {
                  final_hex = final_psbt.extractTransaction().toHex();
                  msg = "Finalized raw TX hex attached to data";
                  data.hex = final_hex;
                } catch (e) {
                  final_hex = signed_tx;
                  data.psbt = {
                    hex: final_psbt.toHex(),
                    base64: final_psbt.toBase64(),
                  };
                }

                if (psbt_hex != final_psbt.toHex()) {
                  results.data = data;
                  results.message = msg;
                  results.success = true;
                  callback(results);
                } else {
                  results.message = "Signed PSBT is the same as input PSBT";
                  callback(results);
                }
              } else {
                results.message = "Unable to sign using unisat";
                callback(results);
              }
            });
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for unisat.sign",
              data: false,
            });
          }
        }
      },
      message: function (params = {}, callback = false) {
        var options = {
          message: false,
        };
        Object.assign(options, params);
        if (options.message && typeof callback == "function") {
          var results = {
            success: false,
            message: "Unisat not installed for message signing",
            data: false,
          };
          if (typeof window.unisat != "undefined") {
            var signed_message = false;

            async function sign() {
              return await window.unisat.signMessage(options.message);
            }
            sign().then(async (signed_message) => {
              if (signed_message) {
                console.log("signed_message", signed_message);
                results.success = true;
                results.message = "Signatures attached to data";
                results.data = {
                  base64: signed_message,
                  hex: Buffer.from(signed_message, "base64").toString("hex"),
                  address: false,
                };
              } else {
                results.message = "Unable to sign message via unisat";
                callback(results);
              }
            });
          } else {
            results.message = "Unisat not installed for messages";
            callback(results);
          }
        } else if (typeof callback == "function") {
          callback({
            data: false,
            success: false,
            message: "Invalid options for unisat.message",
          });
        }
      },
    },
    xverse: {
      key: function (params = {}, callback = false) {
        var options = {
          network: false,
          payload: {
            message: "Provide access to 2 address formats",
          },
        };
        Object.assign(options, params);
        if (
          options.network &&
          typeof callback == "function" &&
          typeof options.payload == "object" &&
          typeof options.payload.message != "undefined"
        ) {
          var results = {
            success: false,
            message: "xVerse not installed",
            data: false,
          };
          if (typeof window.satsConnect != "undefined") {
            const xverse_options = {
              payload: {
                purposes: ["ordinals", "payment"],
                message: options.payload.message,
                network: {
                  type:
                    options.network.charAt(0).toUpperCase() +
                    options.network.slice(1),
                },
              },
              onFinish: (response) => {
                var address = false;
                var public_key = false;
                var addresses = response;
                if (
                  typeof addresses == "object" &&
                  typeof addresses.addresses == "object" &&
                  addresses.addresses.length == 2
                ) {
                  results.success = true;
                  results.message = "Key attached to data";
                  results.data = [];

                  for (a = 0; a < addresses.addresses.length; a++) {
                    results.data.push({
                      pub: addresses.addresses[a].publicKey,
                      address: addresses.addresses[a].address,
                      format: ordit.sdk.addresses.format(
                        addresses.addresses[a].address,
                        options.network
                      ),
                    });
                  }
                } else {
                  results.message = "Invalid address format";
                }
                callback(results);
              },
              onCancel: () => {
                results.message = "Request canceled by xVerse";
                callback(results);
              },
            };

            async function get() {
              await satsConnect.getAddress(xverse_options);
            }
            get();
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for xverse.key",
              data: false,
            });
          }
        }
      },
      sign: function (params = {}, callback = false) {
        var options = {
          psbt: false,
          network: false,
          inputs: false,
        };
        Object.assign(options, params);
        if (
          options.network &&
          typeof options.inputs == "object" &&
          typeof options.psbt == "object" &&
          typeof callback == "function"
        ) {
          var psbt = options.psbt;
          var psbt_base64 = psbt.toBase64();
          var results = {
            success: false,
            message: "xVerse not installed for signing",
            data: false,
          };
          if (typeof window.satsConnect != "undefined") {
            const xverse_options = {
              payload: {
                network: {
                  type:
                    options.network.charAt(0).toUpperCase() +
                    options.network.slice(1),
                },
                message: "Sign Ordit SDK Transaction",
                psbtBase64: psbt_base64,
                broadcast: false,
                inputsToSign: options.inputs,
              },
              onFinish: (response) => {
                var signed_tx = response.psbtBase64;

                if (signed_tx) {
                  var final_psbt = bitcointp.Psbt.fromBase64(signed_tx);

                  var data = {
                    hex: false,
                    psbt: false,
                  };
                  var final_hex = false;
                  var msg = "Unfinalized PSBT attached to data";

                  try {
                    final_psbt.finalizeAllInputs();
                    final_hex = final_psbt.extractTransaction().toHex();
                    msg = "Finalized raw TX hex attached to data";
                    data.hex = final_hex;
                  } catch (e) {
                    final_hex = signed_tx;
                    data.psbt = {
                      hex: final_psbt.toHex(),
                      base64: final_psbt.toBase64(),
                    };
                  }

                  if (signed_tx != psbt_base64) {
                    results.data = data;
                    results.message = msg;
                    results.success = true;
                    callback(results);
                  } else {
                    results.message = "Signed xVerse PSBT same as input";
                    callback(results);
                  }
                } else {
                  results.message = "Unable to sign xVerse transaction";
                  callback(results);
                }
              },
              onCancel: () => {
                results.message = "Signing canceled by xVerse";
                callback(results);
              },
            };

            async function sign() {
              await satsConnect.signTransaction(xverse_options);
            }
            sign();
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for xverse.sign",
              data: false,
            });
          }
        }
      },
      message: function (params = {}, callback = false) {
        var options = {
          address: false,
          message: false,
          network: false,
        };
        Object.assign(options, params);
        if (
          options.network &&
          options.message &&
          options.address &&
          typeof callback == "function"
        ) {
          var results = {
            success: false,
            message: "xVerse not installed for message",
            data: false,
          };
          if (typeof window.satsConnect != "undefined") {
            const xverse_options = {
              payload: {
                network: {
                  type:
                    options.network.charAt(0).toUpperCase() +
                    options.network.slice(1),
                },
                address: options.address,
                message: options.message,
              },
              onFinish: (response) => {
                console.log("response", response);
              },
              onCancel: () => {
                results.message = "Message signing canceled by xVerse";
                callback(results);
              },
            };

            async function get() {
              await satsConnect.signMessage(xverse_options);
            }
            get();
          } else {
            callback(results);
          }
        } else {
          if (typeof callback == "function") {
            callback({
              success: false,
              message: "Invalid options for xverse.message",
              data: false,
            });
          }
        }
      },
    },
    inscription: {
      address: function (params = {}, callback = false) {
        var options = {
          seed: false,
          bip39: false,
          connect: false,
          media_content: false,
          sats_per_byte: 10,
          media_type: "text/plain;charset=utf-8",
          network: "testnet",
          meta: false,
        };
        Object.assign(options, params);
        if (
          options.network &&
          options.media_type &&
          options.media_content &&
          options.sats_per_byte &&
          typeof callback == "function" &&
          (options.seed || options.bip39 || options.connect == "metamask") &&
          // be sure only one of the three inputs is used ...

          !(options.seed && options.bip39 && options.connect) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.seed && options.bip39)
        ) {
          var results = {
            data: false,
            success: false,
            message: "Unsupported network for inscription.address",
          };

          ordit.sdk.wallet.get(options, function (k) {
            if (k.success) {
              var xkey = false;
              for (ke = 0; ke < k.data.keys.length; ke++) {
                if (typeof k.data.keys[ke].xkey != "undefined") {
                  xkey = Buffer.from(k.data.keys[ke].xkey, "hex");
                }
              }
              if (xkey) {
                var net_obj = ordit.sdk.network(options.network);
                if (net_obj) {
                  // Generate inscription address ...

                  var error = false;
                  var address = false;

                  try {
                    options.xkey = xkey;
                    var witness_script = ordit.sdk.inscription.witness(options);

                    var script_tree = {
                      output: witness_script,
                    };
                    var inscribe = bitcointp.payments.p2tr({
                      internalPubkey: xkey,
                      scriptTree: script_tree,
                      network: net_obj,
                    });

                    var fees = JSON.parse(
                      JSON.stringify((80 + 1 * 180) * options.sats_per_byte)
                    );
                    var script_length = witness_script.toString("hex").length;
                    var script_fees =
                      parseInt(script_length / 10) * options.sats_per_byte +
                      fees;

                    address = {
                      address: inscribe.address,
                      xkey: xkey.toString("hex"),
                      format: "inscribe",
                      fees: script_fees,
                    };
                  } catch (e) {
                    error = e;
                  }

                  if (error) {
                    results.message = error;
                  } else {
                    results.success = true;
                    results.message = "Inscription address attached to data";
                    results.data = address;
                  }
                  callback(results);
                } else {
                  callback(results);
                }
              } else {
                results.message = "No xKey provided";
                callback(results);
              }
            } else {
              results.message = k.message;
              callback(results);
            }
          });
        } else if (typeof callback == "function") {
          callback({
            data: false,
            success: false,
            message: "Inavlid options for Inscription.address",
          });
        }
      },
      psbt: function (params = {}, callback = false) {
        var options = {
          seed: false,
          bip39: false,
          connect: false,
          media_content: false,
          destination: false,
          change_address: false,
          fees: 10,
          postage: 10000,
          media_type: "text/plain;charset=utf-8",
          network: "testnet",
          meta: false,
        };
        Object.assign(options, params);
        if (
          options.network &&
          options.media_type &&
          options.media_content &&
          options.destination &&
          options.fees &&
          options.postage &&
          typeof callback == "function" &&
          (options.seed || options.bip39 || options.connect == "metamask") &&
          // be sure only one of the three inputs is used ...

          !(options.seed && options.bip39 && options.connect) &&
          !(options.bip39 && options.connect) &&
          !(options.seed && options.connect) &&
          !(options.seed && options.bip39)
        ) {
          var results = {
            data: false,
            success: false,
            message: "Unsupported network for inscription.psbt",
          };

          var net_obj = ordit.sdk.network(options.network);
          if (net_obj) {
            // Redeem inscription address ...

            var got_seed = function (options) {
              async function get_keys() {
                if (options.bip39) {
                  s = await bip39.mnemonicToEntropy(options.bip39);
                  seeds = s.toString("hex");
                } else {
                  try {
                    var b = bitcointp.crypto
                      .sha256(Buffer.from(options.seed), "utf8")
                      .toString("hex");
                    var m = bip39.entropyToMnemonic(
                      Buffer.from(b, "hex"),
                      bip39.wordlists.english
                    );
                    s = await bip39.mnemonicToEntropy(m);
                    seeds = s.toString("hex");
                  } catch (e) {}
                }

                var root = bip32ecc.fromSeed(
                  Buffer.from(seeds, "hex"),
                  net_obj
                );

                var parent = root;

                if (
                  typeof options.path == "object" &&
                  options.path.length > 0
                ) {
                  for (p = 0; p < options.path.length; p++) {
                    parent = parent.derive(parseInt(options.path[p]));
                  }
                }

                var childNodeXOnlyPubkey = false;

                try {
                  childNodeXOnlyPubkey = parent.publicKey.slice(1, 33);
                } catch (e) {}

                var keys = {
                  pub: Buffer.from(parent.publicKey).toString("hex"),
                  priv: Buffer.from(parent.privateKey).toString("hex"),
                  wif: parent.toWIF(),
                  xkey: childNodeXOnlyPubkey,
                  parent: parent,
                };

                return keys;
              }
              get_keys().then(async (full_keys) => {
                options.xkey = full_keys.xkey;
                var witness_script = ordit.sdk.inscription.witness(options);

                var script_tree = {
                  output: witness_script,
                };

                var redeem_script = {
                  output: witness_script,
                  redeemVersion: 192,
                };

                var inscribe = bitcointp.payments.p2tr({
                  internalPubkey: full_keys.xkey,
                  scriptTree: script_tree,
                  redeem: redeem_script,
                  network: net_obj,
                });

                ordit.sdk.api(
                  {
                    uri: "utxo/unspents",
                    data: {
                      address: inscribe.address,
                      options: {
                        txhex: true,
                        notsafetospend: false,
                        allowedrarity: ["common"],
                      },
                    },
                    network: options.network,
                  },
                  function (unspent) {
                    if (unspent.success) {
                      var unspents = unspent.rdata;
                      var fees_for_witness_data = options.fees;
                      var got_suitable_unspent = false;

                      for (u = 0; u < unspents.length; u++) {
                        if (
                          unspents[u].sats >=
                            options.postage + fees_for_witness_data &&
                          unspents[u].safeToSpend === true
                        ) {
                          got_suitable_unspent = unspents[u];
                        }
                      }

                      if (got_suitable_unspent) {
                        var fees = options.postage + fees_for_witness_data;
                        var change = got_suitable_unspent.sats - fees;

                        var psbt = new bitcointp.Psbt({ network: net_obj });

                        try {
                          psbt.addInput({
                            hash: got_suitable_unspent.txid,
                            index: parseInt(got_suitable_unspent.n),
                            tapInternalKey: full_keys.xkey,
                            witnessUtxo: {
                              script: inscribe.output,
                              value: parseInt(got_suitable_unspent.sats),
                            },
                            tapLeafScript: [
                              {
                                leafVersion: redeem_script.redeemVersion,
                                script: redeem_script.output,
                                controlBlock:
                                  inscribe.witness[inscribe.witness.length - 1],
                              },
                            ],
                          });

                          psbt.addOutput({
                            address: options.destination,
                            value: options.postage,
                          });

                          if (change) {
                            var change_address = inscribe.address;
                            if (
                              typeof options.change_address != "undefined" &&
                              options.change_address
                            ) {
                              change_address = options.change_address;
                            }
                            psbt.addOutput({
                              address: change_address,
                              value: change,
                            });
                          }

                          results.success = true;
                          results.message = "Unsigned PSBT attached to data";
                          results.data = {
                            hex: psbt.toHex(),
                            base64: psbt.toBase64(),
                          };
                          callback(results);
                        } catch (e) {
                          results.message = e.message;
                          callback(results);
                        }
                      } else {
                        results.message =
                          "Unable to find suitable unspent for reveal";
                        callback(results);
                      }
                    } else {
                      results.message = unspent.message;
                      callback(results);
                    }
                  }
                );
              });
            };

            if (options.seed || options.bip39) {
              got_seed(options);
            } else if (options.connect == "metamask") {
              if (typeof window.MetaMaskSDK != "undefined") {
                var MMSDK = new MetaMaskSDK.MetaMaskSDK();
                var ethereum = MMSDK.getProvider(); // You can also access via window.ethereum

                async function get_accounts() {
                  return await ethereum.request({
                    method: "eth_requestAccounts",
                  });
                }
                get_accounts().then(async (accounts) => {
                  var address = accounts[0];
                  var msg = "Generate Bitcoin Addresses from " + address + "?";
                  var seed = await ethereum.request({
                    method: "personal_sign",
                    params: [msg, address],
                  });
                  options.seed = seed;
                  got_seed(options);
                });
              } else {
                results.message = "Metamask not installed";
                callback(results);
              }
            }
          } else {
            callback(results);
          }
        } else if (typeof callback == "function") {
          callback({
            data: false,
            success: false,
            message: "Inavlid options for inscription.reveal",
          });
        }
      },
      witness: function (params = {}) {
        var options = {
          xkey: false,
          media_content: false,
          media_type: "text/plain;charset=utf-8",
          meta: false,
        };
        var witness = false;
        Object.assign(options, params);
        if (options.media_type && options.media_content && options.xkey) {
          try {
            var op_push = function (str) {
              var buff = Buffer.from(str, "utf8");
              var obj = [buff];
              var push = Buffer.concat(obj);
              return push;
            };
            witness = bitcointp.script.compile([
              options.xkey,
              bitcointp.opcodes.OP_CHECKSIG,
              bitcointp.opcodes.OP_FALSE,
              bitcointp.opcodes.OP_IF,
              op_push("ord"),
              1,
              1,
              op_push(options.media_type), // text/plain;charset=utf-8
              bitcointp.opcodes.OP_0,
              op_push(options.media_content), // Hello, world!
              bitcointp.opcodes.OP_ENDIF,
            ]);
            if (typeof options.meta == "object") {
              // application/json;charset=utf-8
              witness = bitcointp.script.compile([
                options.xkey,
                bitcointp.opcodes.OP_CHECKSIG,
                bitcointp.opcodes.OP_FALSE,
                bitcointp.opcodes.OP_IF,
                op_push("ord"),
                1,
                1,
                op_push(options.media_type), // text/plain;charset=utf-8
                bitcointp.opcodes.OP_0,
                op_push(options.media_content), // Hello, world!
                bitcointp.opcodes.OP_ENDIF,

                bitcointp.opcodes.OP_FALSE,
                bitcointp.opcodes.OP_IF,
                op_push("ord"),
                1,
                1,
                op_push("application/json;charset=utf-8"),
                bitcointp.opcodes.OP_0,
                op_push(JSON.stringify(options.meta)),
                bitcointp.opcodes.OP_ENDIF,
              ]);
            }
          } catch (e) {}
        }
        return witness;
      },
    },
  };
})(typeof exports === "undefined" ? (this["ordit"] = {}) : exports);
