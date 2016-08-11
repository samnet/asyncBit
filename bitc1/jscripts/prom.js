var btc = require('bitcore')
var unirest = require('unirest')
var privKey = new btc.PrivateKey.fromWIF('KxqWSvnijPuc9tQpbbvypfHgq6yWF1pDADxcNMxpwE5QASCxJDGp')
var pubKey = privKey.toPublicKey()
var addr = pubKey.toAddress(btc.Networks.livenet)
var pubKeyServer = new btc.PublicKey('03ca9bbdcb0437419b94fdf121826d0be2c31df38daea49f001a13a716cfb64123')
var dest = pubKeyServer.toAddress(btc.Networks.livenet)
var depositAmount = 100000, incrementAmount = 15000


function txPromise(apubKey){
  return new Promise(function(resolve, reject) {
    var anAddr = apubKey.toAddress(btc.Networks.livenet)
    var unirest = require('unirest')
    unirest.get('https://blockchain.info/unspent?cors=true&active=' + anAddr)
    .end(function(response) {
       resolve(response.body) // no reject here !! Todo.
})})};


function txFromP2shPromise(pubKey1, pubKey2, amountTo2){
  var publicKeys = [
    pubKey2,
    pubKey1
    ];
  var scriptAddr = new btc.Address(publicKeys, 2,btc.Networks.livenet);
  redeemScript = new btc.Script(scriptAddr)   // all good I presume
//  redeemScript2 = btc.Script.buildMultisigOut(publicKeys, 2)   // multisig, not p2sh
  //redeemScript3 = redeemScript2.toScriptHashOut() // same as script 1 !!!

  console.log(scriptAddr)
  console.log('redeemScript1:')
  console.log(redeemScript)
  console.log('redeemScript1hex:')
  console.log(redeemScript1.toHex())
  // console.log('redeemScript2:')
  // console.log(redeemScript2)
  // console.log('redeemScript3:')
  // console.log(redeemScript3)



  return new Promise(function(resolve, reject){

    unirest.get('https://blockchain.info/unspent?cors=true&active=' + scriptAddr).end(function)
    console.log(redeemScript)
    console.log('hi')
    resolve(redemScript)
  })

       //   unirest.get('https://blockchain.info/unspent?cors=true&active=' + scriptAddr)
      //   .end(function(response) {
      //     var body = response.body;
      //     var utxosRaw = body["unspent_outputs"]
      //     var UTXOs = []
      //     utxosRaw.forEach(function(elem){
      //       var utxo = new btc.Transaction.UnspentOutput({
      //         "txId" : elem.tx_hash_big_endian,
      //         "outputIndex" : elem.tx_output_n,
      //         "address" : scriptAddr.toString(), // perhaps is teh toSring useful for communication purposes
      //         "script" : elem.script,
      //         //  "script" : new btc.Script(scriptAddr).toHex(), // would not redeemScript work here? How do they go from addr to script
      //         "satoshis" : elem.value })
      //       UTXOs.push(utxo);
      //     })
      //     transaction = new btc.Transaction()
      //       .from(UTXOs)
      //       .to(addr2, amountTo2)
      //       .change(addr1)
      //     resolve(transaction) // no reject here !! Todo.
      //   });
      // })

};

//
// txPromise(pubKey).then(function(out){
//   console.log(out)
//   console.log('p2kh')
// })

txFromP2shPromise(pubKey, pubKeyServer,400).then(function(out){
  console.log(out)
  console.log('p2sh')
})
