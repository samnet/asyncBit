from bitcoin import *
from pprint import *

def balanceAddr(address):
        avlb = sum(multiaccess(unspent(address),'value'))
        return avlb
'''
 2 strategies:
 - mirror
 - inter-feed
'''
# Set-up
privKey = 'KyLuCNsxddnqpdJW1Q3q2mQtkssThJUfcGq9hdCE8W72xYPD3He3'
privKeyServer = 'L4hdBFMfqYBP7XB9teoiwKTNZq9LoJRfJYtiFTxyHMt74MX97c4X'
pubKey = privtopub(privKey)
pubKeyServer = privtopub(privKeyServer)
addr = pubtoaddr(pubKey)
addrServer = pubtoaddr(pubKeyServer)
depositAmount = 80000
incrementAmount = 15000
feeAmount = 13333

# # Funding
# #script = mk_multisig_script([pubKey, pubKeyServer], 2,2) // invert it!
script = mk_multisig_script([pubKeyServer, pubKey], 2,2)
# scriptAddr = scriptaddr(script)
#
# print 'Script: ',script
# print 'ScriptAddr: ',scriptAddr
#
# output = [{'value': depositAmount, 'address': addrServer}]
# fundTx = mksend(unspent(addr), output, addr, feeAmount)
#
# print 'Funding tx: ', fundTx
# fundTx = '0100000002d023b49605aa091f76ba1835d2807e31e31f5117776e330f4a351e252d18b83a010000006b483045022100e5735fa87377557c6417b5a05e130af12b7aba19cd623f4cca63c2f64482e6cd02207a3b9018d06f8b6022a0b60b7fd65cc780e951d3daa8375080d07e68344bd3a70121034cbddad6d4ffbdfba801cf88c05396eb0b6485bf9fa4adba44e260019ce8aa6affffffffb56fd65616a29b1b8dbf361b81ddfdc9ead569e23aac9ba46298293f275ee228010000006a47304402201eb8137f64fbd8cd9ffac58a63c81ffbb8ce8aed17f6df9e30970ae41c7d89700220798026216da9469d91f770e1c3be59df546899e1f96f564c34b0c2dcacce636c0121034cbddad6d4ffbdfba801cf88c05396eb0b6485bf9fa4adba44e260019ce8aa6affffffff011f0301000000000017a91421b78a696fec3349fb626b83bb960d74e7e8e9518700000000'
# signedFundTx = sign(fundTx, 0, privKey)
# print signedFundTx
# pushtx(signedFundTx)

# # spending
# outs = [{'value': depositAmount, 'address': addrServer}, {'value': (balanceAddr(scriptAddr)-depositAmount-10000), 'address': addr}]
# spendTx = mktx(unspent(scriptAddr), outs)
spendTx= '010000000184a1122eed4cee5de99ffbe0aadd614283bbe9b3494932e66734e61c99d633dd00000000490047522102e4e7fa83a6c014cf005e0773bcfd02db1095a72d12df597a34a655e2e9cc6ab721034cbddad6d4ffbdfba801cf88c05396eb0b6485bf9fa4adba44e260019ce8aa6a52aeffffffff02983a0000000000001976a9144c1ced6e542557a8c577871e313a073f38a9ef2a88ac72940000000000001976a9147a5dd8777870e667f108de0ac50127b5bd29d2ff88ac00000000'
sig = multisign(spendTx, 0, script, privKey)
sigServer= multisign(spendTx, 0, script, privKeyServer)
#signedSpendTx = apply_multisignatures(spendTx, 0, script, [sig, sigServer])
signedSpendTx = apply_multisignatures(spendTx, 0, script, [sigServer,sig])

print 'SpendTx: ', spendTx
print 'SignedSpendTx: ', signedSpendTx
