var net = require('net');
var bitcore = require('bitcore-lib');
var message = require('./lib/message');
var blockchainInfo = require("./lib/blockchain_info.js")

if (typeof window === "undefined") {
  console.log("WINDOW_UNDEFINED")
  window = {};
}

function simpleTx (publicKeyClient, publicKeyServer, dep) {
  var address = publicKeyClient.toAddress().toString();

  return blockchainInfo.unspent(address)
    .then(function (output) {
      var utxo = {
        "txId" : output.tx_hash_big_endian,
        "outputIndex" : output.tx_output_n,
        "address" : address,
        "script" : output.script,
        "satoshis" : output.value
      };

      console.log(utxo);
      var transaction = new bitcore.Transaction()
        .from(utxo)
        .to(address, dep);

      return transaction;
    });
}

function fundTx (publicKeyClient, publicKeyServer, dep) {
  var publicKeys = [
    publicKeyClient,
    publicKeyServer
  ];
  var requiredSignatures = 2;
  var address = new bitcore.Address(publicKeys, requiredSignatures);
  var clientAddress = publicKeyClient.toAddress().toString();

  console.log("publicKeys", publicKeys)
  console.log("clientAddress", clientAddress)
  return blockchainInfo.unspent(clientAddress)
    .then(function (output) {
      var utxo = {
        "txId" : output.tx_hash_big_endian,
        "outputIndex" : output.tx_output_n,
        "address" : address,
        "script" : output.script,
        "satoshis" : output.value
      };

      console.log(utxo);
      var transaction = new bitcore.Transaction()
        .from(utxo)
        .to(address, dep);

      console.log(transaction);
      return transaction;
    });
}

function spendTx (publicKeyClient, publicKeyServer, toClient, toServer) {
  var publicKeys = [
    publicKeyClient,
    publicKeyServer
  ];
  var address = new bitcore.Address(publicKeys, 2);
  var redeemScript = bitcore.Script.buildMultisigOut(publicKeys, 2);
  var clientAddress = publicKeyClient.toAddress().toString();

  console.log("publicKeys", publicKeys)
  console.log("address", address)
  console.log("script", new bitcore.Script(address))
  console.log("clientAddress", clientAddress)
  return blockchainInfo.unspent(clientAddress)
    .then(function (output) {
      var utxo = {
        "txId" : output.tx_hash_big_endian,
        "outputIndex" : output.tx_output_n,
        "address" : address.toString(),
        "script" : new bitcore.Script(address).toHex(),
        "satoshis" : output.value
      };

      console.log(utxo);
      var transaction = new bitcore.Transaction()
        .from(utxo, publicKeys, 2)
        .to(publicKeyServer.toAddress().toString(), toServer)
        .to(publicKeyClient.toAddress().toString(), toClient);

      console.log(transaction);
      return transaction;
    });
}

var privateKeyClient = new bitcore.PrivateKey("KzYNCLBNdJBy4WbBtp7biyvpxMgD3v8Z5r4NkyA4MqNRkwzx3Uex");
var publicKeyClient = new bitcore.PublicKey(privateKeyClient);
var publicKeyServer;
