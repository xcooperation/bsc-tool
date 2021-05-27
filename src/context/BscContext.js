import Web3 from "web3"
import BigNumber from "bignumber.js"
import { useContext, createContext } from "react"
import { Router, Factory } from "../constant/Pool"
import PAIR_ABI from "../ABI/PAIR.json"
import BEP20_ABI from "../ABI/BEP20.json"

const BscContext = createContext()

export const BscProvider = function ({ children }) {
  BigNumber.config({ EXPONENTIAL_AT: 50 })
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

  // Get token data
  const getTokenData = async function (address) {
    const contractInstance = new web3.eth.Contract(BEP20_ABI, address)
    return {
      address,
      decimal: await contractInstance.methods.decimals().call(),
      symbol: await contractInstance.methods.symbol().call(),
      ABI: BEP20_ABI,
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
          return { error: "Failed to make allowance for pair to swap." }
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
          return { receipt, error: "Failed to make transaction." }
        }

        return { receipt }
      } else {
        return { error: "Can not send transaction" }
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Check gas fee for creating pair
  const checkCreatingFee = async function (from, token0, token1) {
    try {
      const factoryInstance = new web3.eth.Contract(Factory.ABI, Factory.address)
      // Get estimate gas
      const estimateGas = await factoryInstance.methods
        .createPair(token0.address, token1.address)
        .estimateGas({ gas: 5000000, from: from.address })

      // Get gas fee
      const gasFee = await web3.eth.getGasPrice()
      // total gas
      const totalFee = new BigNumber(gasFee).multipliedBy(estimateGas)

      // Get balance
      const { balanceBnb, balanceErr } = await getBalanceBnb(from.address)
      if (balanceErr) {
        return { error: balanceErr }
      }

      // Compare balance with gas fee
      if (new BigNumber(totalFee).gt(balanceBnb)) {
        return { error: "Insufficient balance." }
      }

      return { sufficient: true }
    } catch (error) {
      console.log(error)
      return { error: error.message }
    }
  }

  // Create pair
  const createPair = async function (from, token0, token1) {
    try {
      const factoryInstance = new web3.eth.Contract(Factory.ABI, Factory.address)

      // Encode transfer data
      const encodedData = await factoryInstance.methods
        .createPair(token0.address, token1.address)
        .encodeABI({ from: from.address })

      // Get estimate gas
      const estimateGas = await factoryInstance.methods
        .createPair(token0.address, token1.address)
        .estimateGas({ gas: 5000000, from: from.address })

      // Get gas fee
      const gasFee = await web3.eth.getGasPrice()

      // Create tx object
      const transactionObject = {
        from: from.address,
        gasPrice: web3.utils.toHex(gasFee.toString()),
        gas: web3.utils.toHex(estimateGas.toString()), // Gas limit
        to: Factory.address,
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

      return { receipt }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Get pair
  const getPair = async function (token0, token1) {
    try {
      const factoryInstance = new web3.eth.Contract(Factory.ABI, Factory.address)
      const pairAddress = await factoryInstance.methods
        .getPair(token0.address, token1.address)
        .call()
      if (pairAddress !== "0x0000000000000000000000000000000000000000") {
        return pairAddress
      }

      return null
    } catch (error) {
      return { error: error.message }
    }
  }

  // Add liquidity BNB
  // token0 => BNB
  const addLiquidityByBNB = async function (from, token1, amount0, amount1) {
    try {
      // Router
      const routerInstance = new web3.eth.Contract(Router.ABI, Router.address)

      // Check approval
      const { approved, error } = await checkApproval(from, token1, Router.address)
      if (error) {
        return { error }
      }

      if (!approved) {
        await approve(from, token1, Router.address)
      }
console.log(convertToDecimal( amount1.toString(), token1.decimal).toString())
      // Encode transfer data
      const encodedData = await routerInstance.methods
        .addLiquidityBNB(
          token1.address,
          convertToDecimal( amount1.toString(), token1.decimal).toString(),
          1,
          1,
          from.address,
          Date.now() + 1000 * 60
        )
        .encodeABI()

      // Get gas fee
      const estimateGas = await routerInstance.methods
        .addLiquidityBNB(
          token1.address,
          convertToDecimal( amount1.toString(), token1.decimal).toString(),
          1,
          1,
          from.address,
          Date.now() + 1000 * 60
        )
        .estimateGas({ gas: 5000000, from: from.address, value: web3.utils.toWei(amount0.toString(), 'ether')})

      // gas fee
      const gasFee = await web3.eth.getGasPrice()
      const totalFee = new BigNumber(gasFee).multipliedBy(estimateGas).plus(web3.utils.toWei(amount0.toString(), 'ether').toString())
console.log(3)
      // Check balance bnb
      const { balanceBnb, error: balanceError } = await getBalanceBnb(from.address)
      if (balanceError) {
        return { error: balanceError }
      }

      // Check balance bnb vs gas fee
      if (new BigNumber(balanceBnb).lt(totalFee)) {
        return { error: `Insufficient balance` }
      }
      console.log(gasFee.toString())
      console.log(web3.utils.toWei(amount0.toString(), 'ether'))
      console.log(estimateGas + estimateGas * 0.1)
      // Create tx object
      const transactionObject = {
        from: from.address,
        gasPrice: gasFee.toString(),
        gas: web3.utils.toHex(estimateGas), // Gas limit
        to: Router.address,
        value: web3.utils.toWei(amount0.toString(), 'ether'), // in wei
        data: web3.utils.toHex(encodedData),
      }
      console.log(5)
      console.log('receipt')
      // Sign transaction
      const signedTransaction = await web3.eth.accounts.signTransaction(
        transactionObject,
        from.privateKey
      )

      // Send signed transaction
      const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      console.log(receipt)
      return { receipt }
    } catch (error) {
      console.log(error)
      return { error: error.message }
    }
  }

  // Add liquidity
  const addLiquidity = async function (from, token_0, token_1, amount0, amount1) {
    try {
      const pairAddress = await getPair(token_0, token_1)
      if (!pairAddress) {
        return { error: "Pair does not exists." }
      }

      // Pair
      const pairInstance = new web3.eth.Contract(PAIR_ABI, pairAddress)
      const token0_address = await pairInstance.methods.token0().call()
      const token1_address = await pairInstance.methods.token1().call()
      const token0 = await getTokenData(token0_address)
      const token1 = await getTokenData(token1_address)
      amount0 =
        token0_address === token0.address
          ? convertToDecimal(amount0, token0.decimal).toString()
          : convertToDecimal(amount1, token1.decimal).toString()
      amount1 =
        token1_address === token1.address
          ? convertToDecimal(amount1, token1.decimal).toString()
          : convertToDecimal(amount0, token0.decimal).toString()

      // Router
      const routerInstance = new web3.eth.Contract(Router.ABI, Router.address)

      // Check approval token0
      const { approved: approvedToken0, error: approved0Err } = await checkApproval(
        from,
        token0,
        Router.address
      )
      if (approved0Err) {
        return { error: approved0Err }
      }
      // Approve token0
      if (!approvedToken0) {
        await approve(from, token0, Router.address)
      }

      // Check approval token0
      const { approved: approvedToken1, error: approved1Err } = await checkApproval(
        from,
        token0,
        Router.address
      )
      if (approved1Err) {
        return { error: approved1Err }
      }

      // Approve token1
      if (!approvedToken0) {
        await approve(from, token0, Router.address)
      }

      // Check approval token1
      if (approvedToken0 && approvedToken1) {
        // Encode transfer data
        const encodedData = await routerInstance.methods
          .addLiquidity(
            token0.address,
            token1.address,
            amount0,
            amount1,
            amount0,
            amount1,
            from.address,
            Date.now() + 1000 * 60
          )
          .encodeABI()

        // Get gas fee
        const estimateGas = await routerInstance.methods
          .addLiquidity(
            token0.address,
            token1.address,
            amount0,
            amount1,
            amount0,
            amount1,
            from.address,
            Date.now() + 1000 * 60
          )
          .estimateGas({ gas: 5000000, from: from.address })

        // gas fee
        const gasFee = await web3.eth.getGasPrice()
        const totalFee = new BigNumber(gasFee).multipliedBy(estimateGas)
        // Check balance bnb
        const { balanceBnb, error: balanceError } = await getBalanceBnb(from.address)
        if (balanceError) {
          return { error: balanceError }
        }

        // Check balance bnb vs gas fee
        if (new BigNumber(balanceBnb).lt(totalFee)) {
          return { error: `Insufficient balance` }
        }

        // Create tx object
        const transactionObject = {
          from: from.address,
          gasPrice: web3.utils.toHex(gasFee.toString()),
          gas: web3.utils.toHex(estimateGas + estimateGas * 0.1), // Gas limit
          to: Router.address,
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
        console.log(receipt)
        return { receipt }
      }

      return { error: `Failed to add liquidity` }
    } catch (error) {
      console.log(error)
      return { error: error.message }
    }
  }

  /** RETURN */
  return (
    <BscContext.Provider
      value={{
        // variables
        web3,
        resultStorageName,
        swapStorageName,
        swapResultStorageName,
        // Utility
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
        // Pool
        checkCreatingFee,
        createPair,
        addLiquidity,
        addLiquidityByBNB,
      }}
    >
      {children}
    </BscContext.Provider>
  )
}

export const useBscContext = function () {
  return useContext(BscContext)
}
