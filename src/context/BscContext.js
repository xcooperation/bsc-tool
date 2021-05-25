import Web3 from "web3"
import BigNumber from "bignumber.js"
import { useContext, createContext } from "react"

const BscContext = createContext()

export const BscProvider = function ({ children }) {
  const bsc_rpc_main = "https://bsc-dataseed.binance.org/"
  const bsc_rpc_test = "https://data-seed-prebsc-1-s1.binance.org:8545/"
  const web3 = new Web3(bsc_rpc_test)
  const localStorageName = "bsc-wallets"
  const resultStorageName = "bsc-result"

  // Generate wallet
  const generateWallet = async (quantity) => {
    if (quantity <= 0) {
      throw new Error("Can not generate wallet with the quantity of 0")
    }

    const wallets = await web3.eth.accounts.wallet.create(quantity)

    const generatedWallets = []

    for (let i = 0; i < quantity; i++) {
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
  const getWalletByPK = function (wallet_pk) {
    if (!wallet_pk) {
      throw new Error("Private key is not valid.")
    }
    try {
      return { wallet: web3.eth.accounts.privateKeyToAccount(wallet_pk.toString().trim()) }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Convert from decimals to token
  const convertToToken = function (amountToken, decimal) {
    return new BigNumber(amountToken.toString()).dividedBy(10 ** parseInt(decimal))
  }

  // Convert from decimals to token
  const convertToDecimal = function (amountToken, decimal) {
    // BigNumber.config({ DECIMAL_PLACES: decimals.toString().length })
    return new BigNumber(amountToken.toString()).multipliedBy(10 ** parseInt(decimal))
  }

  // Validate wallet
  const validateWallet = function (fromAddress, toAddress) {
    if (
      !web3.utils.isAddress(fromAddress.trim()) ||
      !web3.utils.isAddress(toAddress.toString().trim())
    ) {
      return { error: "Invalid address format." }
    }

    // Check duplicate
    if (fromAddress.trim() === toAddress.toString().trim()) {
      return { error: "Same address." }
    }
    return { valid: true }
  }

  // Get balance of Bnb
  const getBalanceBnb = async function (address) {
    try {
      return { balanceBnb: await web3.eth.getBalance(address.toString().trim()) }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Get balance of Bep20
  const getBalanceBep20 = async function (address, BEP20_TOKEN) {
    try {
      const contractInstance = new web3.eth.Contract(BEP20_TOKEN.ABI, BEP20_TOKEN.address)
      let balanceBep20 = await contractInstance.methods.balanceOf(address.toString().trim()).call()
      balanceBep20 = balanceBep20.toString()

      return { balanceBep20 }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Get gas price
  const calculateGas = async function () {
    try {
      return { gasFee: await web3.eth.getGasPrice() }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Check balance of BNB
  const checkBnbBalance = async function (wallet, amountOfEther) {
    const amountOfWei = web3.utils.toWei(amountOfEther.toString(), "ether")
    try {
      // Balance of BNB
      const balanceBNB = await web3.eth.getBalance(wallet.address)

      // Check balance BNB
      if (new BigNumber(balanceBNB).lt(amountOfWei) || new BigNumber(balanceBNB).eq(0)) {
        return { error: "Insufficient balance." }
      }

      return { sufficient: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Check balance of BEP20
  const checkBep20Balance = async function (wallet, amountOfBep20, BEP20_TOKEN) {
    try {
      const amountOfDecimal = convertToDecimal(amountOfBep20.toString(), BEP20_TOKEN.decimal)
      // Balance of BNB
      const { balanceBep20 } = await getBalanceBep20(wallet.address, BEP20_TOKEN)

      // Check balance BNB
      if (new BigNumber(balanceBep20).lt(amountOfDecimal) || new BigNumber(balanceBep20).eq(0)) {
        return { error: "Insufficient balance." }
      }

      return { sufficient: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Calculate contract Fee
  const calculateBEP20Fee = async function (BEP20_TOKEN, wallet, toAddress, amountOfEther) {
    try {
      const contractInstance = new web3.eth.Contract(BEP20_TOKEN.ABI, BEP20_TOKEN.address)
      const amountOfWei = convertToDecimal(amountOfEther, BEP20_TOKEN.decimal)
      const gasFee = await web3.eth.getGasPrice()
      // Calculate gas
      const estimateGas = await contractInstance.methods
        .transfer(toAddress, amountOfWei.toString())
        .estimateGas({ from: wallet.address })
      
      const totalFee = new BigNumber(gasFee).multipliedBy(estimateGas)
      return totalFee
    } catch (error) {
      return { error: error.message }
    }
  }

  // Spread BNB
  const sendBNB = async function (wallet, toAddress, amountOfEther) {
    const amountOfWei = web3.utils.toWei(amountOfEther.toString(), "ether")
    const gasPrice = await web3.eth.getGasPrice()
    const gas = 21000
    const transferAmount = new BigNumber(amountOfWei).minus(gas * gasPrice)

    // Insufficient amount
    if (transferAmount.lt(0)) {
      return { error: "Amount is too small, below the gas fee" }
    }

    try {
      const nonce = await web3.eth.getTransactionCount(wallet.address, "pending")
      const txObject = {
        nonce: web3.utils.toHex(nonce),
        from: wallet.address,
        to: toAddress.toString(),
        gasPrice,
        gas,
        value: web3.utils.toHex(transferAmount.toString()),
      }

      const signedTransaction = await web3.eth.accounts.signTransaction(txObject, wallet.privateKey)

      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)

      return { receipt }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Spread BEP20
  const sendBEP20 = async function (wallet, toAddress, amountOfBEP20, BEP20_TOKEN) {
    try {
      const contractInstance = new web3.eth.Contract(BEP20_TOKEN.ABI, BEP20_TOKEN.address)
      // Convert amountERC20
      const amountOfWei = convertToDecimal(amountOfBEP20, BEP20_TOKEN.decimal)
      // Calculate transfer data
      const transferData = await contractInstance.methods
        .transfer(toAddress, amountOfWei.toString())
        .encodeABI()


      // Calculate gas
      const estimateGas = await contractInstance.methods
        .transfer(toAddress, amountOfWei.toString())
        .estimateGas({ from: wallet.address })

      const nonce = await web3.eth.getTransactionCount(wallet.address, "pending")
      // Create transaction
      const transactionObject = {
        nonce: web3.utils.toHex(nonce),
        from: wallet.address,
        gas: web3.utils.toHex(estimateGas.toString()), // Gas limit
        to: BEP20_TOKEN.address,
        value: "0", // in wei
        data: web3.utils.toHex(transferData),
      }

      // Sign transaction
      const signedTransaction = await web3.eth.accounts.signTransaction(
        transactionObject,
        wallet.privateKey
      )

      // Send signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)

      return { receipt }
    } catch (error) {
      return { error: error.message }
    }
  }

  return (
    <BscContext.Provider
      value={{
        // variables
        web3,
        resultStorageName,
        generateWallet,
        getWalletByPK,
        // Convert
        convertToDecimal,
        convertToToken,
        // Balance
        getBalanceBnb,
        getBalanceBep20,
        // Gas fee
        calculateGas,
        calculateBEP20Fee,
        // localStorage
        storeData,
        getData,
        removeData,
        // Validation
        checkBnbBalance,
        checkBep20Balance,
        validateWallet,
        // transaction
        sendBNB,
        sendBEP20,
      }}
    >
      {children}
    </BscContext.Provider>
  )
}

export const useBscContext = function () {
  return useContext(BscContext)
}
