import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import {useContext, createContext} from 'react'

const BscContext = createContext()

export const BscProvider = function({children}) {
  const bsc_rpc_main = 'https://bsc-dataseed.binance.org/'
  const bsc_rpc_test = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  const web3 = new Web3(bsc_rpc_test)
  const localStorageName = "bsc-wallets"
  const resultStorageName = 'bsc-result'

  // Generate wallet
  const generateWallet = async (quantity) => {
    if (quantity <= 0) {
      throw new Error("Can not generate wallet with the quantity of 0")
    }

    const wallets = await web3.eth.accounts.wallet.create(quantity)

    const generatedWallets = []

    for (let i = 0; i < quantity ;i++) {
      generatedWallets.push({
        index: i + 1,
        address: wallets[i.toString()].address,
        privateKey: wallets[i.toString()].privateKey,
      })
    }

    return generatedWallets
  }

  // Store to localStorage
  const storeData = (data, name = localStorageName) => {
    const jsonData = JSON.stringify(data)
    localStorage.setItem(name, jsonData)
  }

  // Get data from localStorage
  const getData = (name = localStorageName) => {
    const jsonData = localStorage.getItem(name)
    if (jsonData) {
      return JSON.parse(jsonData)
    } else {
      return null
    }
  }

  // Remove data from localStorage
  const removeData = (name = localStorageName) => {
    return localStorage.removeItem(name)
  }

  // Get Wallet by PK
  const getWalletByPK = function(wallet_pk) {
    if (!wallet_pk) {
      throw new Error("Private key is not valid.")
    }
    try {
      return {wallet: web3.eth.accounts.privateKeyToAccount(wallet_pk.toString().trim())} 
    } catch (error) {
      return {error: error.message}
    }
  }

  // Validate wallet
  const validateWallet = function(address) {
    if (web3.utils.isAddress(address)) {
      return true
    }

    return false
  }

  // Get balance of Bnb
  const getBalanceBnb = async function(address) {
    try {
      return { balanceBnb: await web3.eth.getBalance(address.toString().trim()) }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Get gas price
  const calculateGas = async function() {
    try {
      return {gasFee: await web3.eth.getGasPrice()} 
    } catch (error) {
      return {error: error.message}
    }
  }

  // Check balance of BNB
  const checkBnbBalance = async function(account, amountOfEther) {
    const amountOfWei = web3.utils.toWei(amountOfEther.toString(), 'ether')
    try {
      // Balance of BNB
      const balanceBNB = await web3.eth.getBalance(account.address)
      
      // Check balance BNB
      if (new BigNumber(balanceBNB).lt(amountOfWei) || new BigNumber(balanceBNB).eq(0)) {
        return {error: 'Insufficient balance.'}
      }

      return {sufficient: true}
    } catch (error) {
      return {error: error.message}
    }
  }
  

  // Spread BNB
  const sendBNB = async function(wallet, toAddress, amountOfEther) {
    const amountOfWei = web3.utils.toWei(amountOfEther.toString(), 'ether')
    const gasPrice = await web3.eth.getGasPrice()
    const gas = 21000
    const transferAmount = new BigNumber(amountOfWei).minus(gas * gasPrice )
    
    // Insufficient amount
    if (transferAmount.lt(0)) {
      return {error: 'Amount is too small, below the gas fee'}
    }

    try {
      const nonce = await web3.eth.getTransactionCount(wallet.address, "pending")
      const txObject = {
        nonce: web3.utils.toHex(nonce),
        from: wallet.address,
        to: toAddress.toString(),
        gasPrice,
        gas,
        value: web3.utils.toHex(transferAmount.toString())
      }

      const signedTransaction = await web3.eth.accounts.signTransaction(txObject, wallet.privateKey)

      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      
      return {receipt}
    } catch (error) {
      return {error: error.message}
    }
  }

  // Spread BEP20
  const spreadBEP20 = async function(wallet_pk, toAddress, amountOfBEP20, tokenBEP20) {

  }
  
  return (
    <BscContext.Provider value={{
      // variables
      web3, resultStorageName,
      generateWallet, getWalletByPK,
      getBalanceBnb, calculateGas,
      // localStorage
      storeData, getData, removeData,
      // Validation
      checkBnbBalance, validateWallet,
      // transaction
      sendBNB
    }}>
      {children}
    </BscContext.Provider>
  )
}

export const useBscContext = function() {
  return useContext(BscContext)
}