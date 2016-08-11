/*
Dependencies: bitcore (global), unirest (almost global),
>> check taht unirest and bitcore-lib are front-end compatible

// browsify to compile
> bluebird - is a promise library
> unirest - is a http request
> JQUERY deferred vs. promise
> management of asynchronicity
Primise.each(<iterator>, (returns a promise))
*/
"use strict";
var btc = require('bitcore-lib')
var unirest = require('unirest')
var privKey = new btc.PrivateKey.fromWIF('KyLuCNsxddnqpdJW1Q3q2mQtkssThJUfcGq9hdCE8W72xYPD3He3')
  // 1CA1rufdFggCkd4kZQaff6NxZa1P9AfrrE
var pubKey = privKey.toPublicKey()
var addr = pubKey.toAddress(btc.Networks.livenet)
var pubKeyServer = new btc.PublicKey('02e4e7fa83a6c014cf005e0773bcfd02db1095a72d12df597a34a655e2e9cc6ab7')
  // 17wT1VgpwdWKqvLza8y2AVWoiLpaLJ8XHq
var dest = pubKeyServer.toAddress(btc.Networks.livenet)
var depositAmount = 66335, incrementAmount = 15000, feeAmount = 13333

// Process the result of http request to blockchain.info into bitcore's UTXO object format
function HTTPtoUTXO(response, anAddr){
  var body = response.body;
  var utxosRaw = body["unspent_outputs"]
  var UTXOs = []
  utxosRaw.forEach(function(elem){
    var utxo = new btc.Transaction.UnspentOutput({
      "txId" : elem.tx_hash_big_endian,
      "outputIndex" : elem.tx_output_n,
      "address" : anAddr,
      "script" : elem.script,
      "satoshis" : elem.value })
    UTXOs.push(utxo);
  })
  return UTXOs
}

// Return, as a promise, an unigned transaction
function txPromise(pubkey, toAddr, amount){
  var srcAddr = pubkey.toAddress(btc.Networks.livenet)
  return new Promise(function(resolve, reject) {
    unirest.get('https://blockchain.info/unspent?cors=true&active=' + srcAddr)
    .end(function(response) {
      var UTXOs = HTTPtoUTXO(response, srcAddr)
      console.log('Utxos retrieved and processed:', UTXOs)
      var transaction = new btc.Transaction()
        .from(UTXOs)
        .to(toAddr, amount)
        .change(srcAddr)
        .fee(feeAmount)
       resolve(transaction) // no reject here !! Todo.
    })
  })
};

// The Client funds the Payment Channel
var scriptAddr = new btc.Address([pubKey, pubKeyServer],2, btc.Networks.livenet)
console.log(scriptAddr)
txPromise(pubKey, scriptAddr, depositAmount).then(function(out){
  //console.log('Funding tx, UNsigned: ', out)
  out.sign(privKey)
  console.log('Funding tx, signed: ', out)
})
//debugger;

// Function to automate spending from a P2SH address
function txFromP2shPromise(pubKey1, pubKey2, amountTo2){

  var publicKeys = [pubKey1, pubKey2];
  var scriptAddr = new btc.Address(publicKeys, 2, btc.Networks.livenet)
  var redeemScript = new btc.Script(scriptAddr)
  var addr1 = pubKey1.toAddress().toString();
  var addr2 = pubKey2.toAddress().toString();
  console.log(redeemScript)

  return new Promise(function(resolve, reject) {
    console.log('salut')
    unirest.get('https://blockchain.info/unspent?cors=true&active=' + scriptAddr)
      .end(function(response) {
        var body = response.body;
        var utxosRaw = body["unspent_outputs"]
        console.log('UtxosRaw: ', utxosRaw)
        var UTXOs = []
        utxosRaw.forEach(function(elem){
          var utxo = new btc.Transaction.UnspentOutput({
            "txId" : elem.tx_hash_big_endian,
            "outputIndex" : elem.tx_output_n,
            "address" : scriptAddr, // .toString() / .toHex() ?
            "script" : elem.script,
            //  "script" : new bitcore.Script(scriptAddr).toHex(), // would not redeemScript work here? How do they go from addr to script
            "satoshis" : elem.value })
          UTXOs.push(utxo);
        })
        var transaction = new btc.Transaction()
          .from(UTXOs, publicKeys, 2)
          .to(addr2, amountTo2)
          .change(addr1)
          .fee(feeAmount)
        resolve(transaction) // no reject here !! Todo.
      });
  })
};

var privKeyServer = new btc.PrivateKey.fromWIF('L4hdBFMfqYBP7XB9teoiwKTNZq9LoJRfJYtiFTxyHMt74MX97c4X')
setTimeout(function(){
  txFromP2shPromise(pubKey, pubKeyServer, incrementAmount).then(function(out){
    console.log('txFromP2shPromise returned: ', out)
    out.sign([privKey,privKeyServer])
    console.log('Signed spend transaction: ', out)
  })
},10000)

console.log('hi')
