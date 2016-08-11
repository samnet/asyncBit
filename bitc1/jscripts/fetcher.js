/*
Dependencies: bitcore (global), unirest (almost global),


> dependencies: check taht unirest and bitcore-lib are front-end compatible


// browsify to compile


> dev on node
> bluebird - is a promise library
> unirest - is a http request
> JQUERY deferred vs. promise
> management of asynchronicity
> after line 260 of Bundle client
> translation to ionic framework
> pgming in node vs. directly in jscript?

Primise.each(<iterator>, (returns a promise))

*/

var btc = require('bitcore-lib')
var unirest = require('unirest')
var privKey = new btc.PrivateKey.fromWIF('KxqWSvnijPuc9tQpbbvypfHgq6yWF1pDADxcNMxpwE5QASCxJDGp')
var pubKey = privKey.toPublicKey()
var addr = pubKey.toAddress(btc.Networks.livenet)
var pubKeyServer = new btc.PublicKey('03ca9bbdcb0437419b94fdf121826d0be2c31df38daea49f001a13a716cfb64123')
var dest = pubKeyServer.toAddress(btc.Networks.livenet)
var depositAmount = 100000, incrementAmount = 15000

// Note that in fact we dont need use getHTML-like stuff... bitcore can retrieve UTXOs:
// var fetchUTXOs = function(anAddr){
//   var Insight = require('bitcore-explorers').Insight;
//   var insight = new Insight();
//   insight.getUnspentUtxos(anAddr, function(err, utxos) {
//     if (err){
//       console.log("problem retrieving the utxos of "+ anAddr)
//     } else {
//       return utxos
//     }
//   });
// };




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

  return new Promise(function(resolve, reject) {

    var anAddr = pubkey.toAddress(btc.Networks.livenet)

    unirest.get('https://blockchain.info/unspent?cors=true&active=' + anAddr)
    .end(function(response) {
      UTXOs = HTTPtoUTXO(response, anAddr)
      transaction = new btc.Transaction()
        .from(UTXOs)
        .to(toAddr, amount)
        .change(anAddr)
       resolve(transaction) // no reject here !! Todo.
    })
  })
};

function scriptAddrMaker(pubKey1, pubKey2){
  var publicKeys = [
    pubKey1,
    pubKey2
  ];
  var scriptAddr = new btc.Address(publicKeys, 2);
  return scriptAddr
}

scriptAddr = scriptAddrMaker(pubKey, pubKeyServer)
console.log(scriptAddr)
txPromise(pubKey, scriptAddr, depositAmount).then(function(out){
  out.sign(privKey)
  console.log(out)
})

function txFromP2shPromise(pubKey1, pubKey2, amountTo2){

  return new Promise(function(resolve, reject) {

    var scriptAddr = scriptAddrMaker(pubkey1, pubkey2)
    console.log('salut')
    var redeemScript = btc.Script.buildMultisigOut(publicKeys, 2);

    console.log(redeemScript)
    var addr1 = pubKey1.toAddress().toString();
    var addr2 = pubKey2.toAddress().toString();

    unirest.get('https://blockchain.info/unspent?cors=true&active=' + scriptAddr)
    .end(function(response) {
      var body = response.body;
      var utxosRaw = body["unspent_outputs"]
      var UTXOs = []
      utxosRaw.forEach(function(elem){
        var utxo = new btc.Transaction.UnspentOutput({
          "txId" : elem.tx_hash_big_endian,
          "outputIndex" : elem.tx_output_n,
          "address" : scriptAddr.toString(), // perhaps is teh toSring useful for communication purposes
          "script" : elem.script,
          //  "script" : new bitcore.Script(scriptAddr).toHex(), // would not redeemScript work here? How do they go from addr to script
          "satoshis" : elem.value })
        UTXOs.push(utxo);
      })
      transaction = new btc.Transaction()
        .from(UTXOs)
        .to(addr2, amountTo2)
        .change(addr1)
      resolve(transaction) // no reject here !! Todo.
    });
  })

};

txFromP2shPromise(pubKey, pubKeyServer, incrementAmount).then(function(out){
  console.log(out)
})
console.log('hi')





//
//   console.log(output)
// })
// console.log(sstx)
// // SIMPLE TX
// function simpleTx (fromAddr, toAddr, amount) {
//   var transaction = new
//   getHTML(fromAddr, function(html){
//     var UTXOs = parseUTXOs(html)
//     transaction = new btc.Transaction()
//      .from(UTXOs)
//      .to(toAddr, amount);
//    })
//   return transaction;
// });

//
//
//
//
// var address = pubKeyClient.toAddress().toString();
//
