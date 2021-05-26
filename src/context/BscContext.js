import Web3 from "web3"
import BigNumber from "bignumber.js"
import { useContext, createContext } from "react"
import { Router } from "../constant/Pool"

const BscContext = createContext()

export const BscProvider = function ({ children }) {
  const bsc_rpc_main = "https://bsc-dataseed.binance.org/"
  const bsc_rpc_test = "https://data-seed-prebsc-1-s1.binance.org:8545/"
  const web3 = new Web3(bsc_rpc_test)
  const localStorageName = "bsc-wallets"
  const resultStorageName = "bsc-result"
  const swapStorageName = "bsc-swap-wallets"
  const swapResultStorageName = "bsc-swap-result-wallets"

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
      const { address, privateKey } = web3.eth.accounts.privateKeyToAccount(
        wallet_pk.toString().trim()
      )
      return { wallet: { address, privateKey } }
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

      // Gas fee
      const gasFee = await web3.eth.getGasPrice()

      const nonce = await web3.eth.getTransactionCount(wallet.address, "pending")
      // Create transaction
      const transactionObject = {
        nonce: web3.utils.toHex(nonce),
        from: wallet.address,
        gasPrice: web3.utils.toHex(gasFee.toString()),
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

  // Approve
  const approve = async function (from, token, toAddress) {
    try {
      const tokenInstance = new web3.eth.Contract(token.ABI, token.address)
      const approveAmount =
        "115792089237316195423570985008687907853269984665640554039457584007913129639935"

      // Encode transfer data
      const encodedData = await tokenInstance.methods
        .approve(toAddress, approveAmount)
        .encodeABI({ from: from.address })
      // Get gas fee
      const estimateGas = await tokenInstance.methods
        .approve(toAddress, approveAmount)
        .estimateGas({ gas: 5000000, from: from.address })

      const totalFee = new BigNumber(estimateGas).multipliedBy((await calculateGas()).gasFee)
      const { balanceBnb } = await getBalanceBnb(from.address)
      if (totalFee.gt(balanceBnb)) {
        return { error: `Insufficient to approve` }
      }

      // Create tx object
      const transactionObject = {
        from: from.address,
        gas: web3.utils.toHex(estimateGas.toString()), // Gas limit
        to: token.address,
        value: "0", // in wei
        data: web3.utils.toHex(encodedData),
      }

      // Sign transaction
      const signedTransaction = await web3.eth.accounts.signTransaction(
        transactionObject,
        from.privateKey
      )

      // Send signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)

      return receipt
    } catch (error) {
      throw error
    }
  }

  // Check approval
  const checkApproval = async function (from, token, toAddress) {
    try {
      const tokenInstance = new web3.eth.Contract(token.ABI, token.address)

      // Get gas fee
      const isApproved = await tokenInstance.methods.allowance(from.address, toAddress).call()

      if (isApproved.toString() !== "0") {
        return { approved: true }
      }

      return { approved: false }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Swap tokens
  const swapTokenToToken = async function (wallet, token0, amountToken0, TOKENS) {
    try {
      const routerInstance = new web3.eth.Contract(Router.ABI, Router.address)
      // Convert amountERC20
      const amountOfWei = convertToDecimal(amountToken0, token0.decimal)
      // Path
      const path =
        TOKENS[0].address === token0.address
          ? [token0.address, TOKENS[1].address]
          : [token0.address, TOKENS[0].address]

      // Check approval
      const { approved, error } = await checkApproval(wallet, token0, Router.address)
      if (error) {
        return { error }
      }
      
      let transfer = false
      if (!approved) {
        const approveTx = await approve(wallet, token0, Router.address)
        if (approveTx.status === false) {
          return {error: 'Failed to make allowance for pair to swap.'}
        } else {
          transfer = true
        }
      }
      
      if (transfer || approved) {
        // Calculate transfer data
        const transferData = await routerInstance.methods
          .swapExactTokensForTokens(
            amountOfWei, // input
            1, // min output
            path, // path
            wallet.address, // recipient
            Date.now() + 1000 * 60 * 5 // deadline
          )
          .encodeABI()

        // Calculate gas
        const estimateGas = await routerInstance.methods
          .swapExactTokensForTokens(
            amountOfWei, // input
            1, // min output
            path, // path
            wallet.address, // recipient
            Date.now() + 1000 * 60 * 5 // deadline
          )
          .estimateGas({ from: wallet.address })

        // Gas fee
        const gasFee = await web3.eth.getGasPrice()

        const nonce = await web3.eth.getTransactionCount(wallet.address, "pending")
        // Create transaction
        const transactionObject = {
          nonce: web3.utils.toHex(nonce),
          from: wallet.address,
          gasPrice: web3.utils.toHex(gasFee.toString()),
          gas: web3.utils.toHex(estimateGas.toString()), // Gas limit
          to: Router.address,
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

        if (receipt.status === false) {
          return {receipt, error: 'Failed to make transaction.'}
        }

        return { receipt }
      } else {
        return { error: "Can not send transaction" }
      }
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
        swapStorageName,
        swapResultStorageName,
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
        swapTokenToToken,
      }}
    >
      {children}
    </BscContext.Provider>
  )
}

export const useBscContext = function () {
  return useContext(BscContext)
}
