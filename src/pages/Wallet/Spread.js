import { useEffect, useState, useRef } from "react"
import { useBscContext } from "../../context/BscContext"
import BigNumber from 'bignumber.js'

// Components
import SpreadForm from "../../components/Form/SpreadForm"
import Logger from "../../components/Logger/Logger"

export default function Spread({ data, token, setStage, amount, setAmount, setMainWallet, mainWallet }) {
  const { checkBnbBalance, checkBep20Balance, web3, getWalletByPK, storeData, resultStorageName, sendBNB, sendBEP20, validateWallet, getBalanceBnb, getBalanceBep20, calculateBEP20Fee } = useBscContext()
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const LoggerDiv = useRef()

  // handle submit
  const handleSubmit = async function (e) {
    e.preventDefault()
    const { wallet_pk_inp, amount_inp } = e.target.elements
    const wallet_pk = wallet_pk_inp.value
    const spreadAmount = parseFloat(amount_inp.value)
    if (spreadAmount < 0) {
      setError("Amount is not valid.")
    } else {
      setAmount(spreadAmount)
    }

    const { wallet, error } = getWalletByPK(wallet_pk)
    
    if (error) {
      setError(error)
    } else {
      setError("")
      setMainWallet(wallet)
      return await checkBalance(wallet)
    }
  }

  // Check balance
  async function checkBalance(wallet) {
    try {
      // BNB
      if (token.symbol === 'BNB') {
        const totalAmount = new BigNumber(data.length).multipliedBy(amount)
        const { error, sufficient } = await checkBnbBalance(wallet, totalAmount)
        
        if (error) {
          setError(error)
        } else if (sufficient) {
          setIsValid(true)
        }
        return
      }

      // BEP20
      if (token.symbol !== 'BNB') {
        const totalAmount = new BigNumber(data.length).multipliedBy(amount)
        const { error, sufficient } = await checkBep20Balance(wallet, totalAmount, token)
        
        if (error) {
          setError(error)
        } else if (sufficient) {
          setIsValid(true)
        }
        return
      }
    } catch (error) {
      setError(error)
    }
  }

  // BNB Validation
  async function bnbValidation(wallet, amountOfEther) {
    try {
      // Check address
      const {error: invalidFormat} = validateWallet(wallet.address, mainWallet.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Check balance bnb of main wallet
      const {error} = await checkBnbBalance(mainWallet, amountOfEther)
      if (error) {
        return {error}
      }

      return {valid: true}
    } catch (error) {
      return {error: error.message}
    }
  }

  // BEP20 Validation
  async function bep20Validation (wallet, amountOfEther) {
    try {
      // Check address
      const {error: invalidFormat} = validateWallet(wallet.address, mainWallet.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Get balance Bnb
      const {error: bnbError} = await getBalanceBnb(mainWallet.address)
      if (bnbError) {
        return {error: bnbError}
      }

      // Get gas price
      const gasFee = await calculateBEP20Fee(token, mainWallet, wallet.address, amountOfEther)
      
      // Check balanceBnb >  gas Fee
      const {error: invalidBnb} = await checkBnbBalance(mainWallet, web3.utils.fromWei(gasFee.toString(), 'ether'))
      if (invalidBnb) {
        return {error: invalidBnb}
      }

      // Get balanceBep20
      const {error: bep20Err} = await getBalanceBep20(mainWallet.address, token)
      if(bep20Err) {
        return {error: bep20Err}
      }

      // Check balanceBep20
      const {error: invalidBep20} = await checkBep20Balance(mainWallet, amountOfEther, token)
      if (invalidBep20) {
        return {error: invalidBep20}
      }
      
      return {valid: true}
    } catch (error) {
      return {error: error.message}
    }
  }

  // Spread BNB
  async function spreadBnb (cloneWallet, amountOfEther, setMessage) {
    try {
      // Validate
      const {valid, error: invalidError} = await bnbValidation(cloneWallet, amountOfEther)
      if (invalidError || !valid) {
        setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. --- [FAIL] ${invalidError}`)
        return {...cloneWallet, error: invalidError}
      }
      // Send Bnb
      const {receipt, error: txError} = await sendBNB(mainWallet, cloneWallet.address, amountOfEther)
      if (txError) {
        setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. --- [FAIL] ${txError}`)
        return {...cloneWallet, error: txError}
      }

      // SUCCESS
      if (receipt) {
        setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. -- [SUCCESS]`)
        return {...cloneWallet, hash: receipt.transactionHash}
        
      }

    } catch (err) {
      setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. -- [FAIL] ${err.message}`)
      return {...cloneWallet, error: err.message}
    }
    
  }  
  
  // Spread BEP20
  async function spreadBep20 (cloneWallet, amountOfEther, setMessage) {
    try {
      // Validate
      const {valid, error: invalidError} = await bep20Validation(cloneWallet, amountOfEther)
      
      if (invalidError || !valid) {
        setMessage(`Sending ${amountOfEther} ${token.symbol} to ${cloneWallet.address}. --- [FAIL] ${invalidError}`)
        return {...cloneWallet, error: invalidError}
      }
      // Send Bep20
      const {receipt, error: txError} = await sendBEP20(mainWallet, cloneWallet.address, amountOfEther, token)
      if (txError) {
        setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. --- [FAIL] ${txError}`)
        return {...cloneWallet, error: txError}
      }

      // SUCCESS
      if (receipt) {
        setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. -- [SUCCESS]`)
        return {...cloneWallet, hash: receipt.transactionHash}
        
      }

    } catch (err) {
      setMessage(`Sending ${amountOfEther} ${token.symbol}  to ${cloneWallet.address}. -- [FAIL] ${err.message}`)
      return {...cloneWallet, error: err.message}
    }
  }

  // [BNB]
  async function spreadBnbAll() {
    const spread = await Promise.all(data.map((sender, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultData = await spreadBnb(sender, amount, setMessage)
          
          return resolve(resultData)
        }, 1000 * index)
      })
    }))

    return spread
  }

  // [BEP20]
  async function spreadBep20All() {
    const spread = await Promise.all(data.map((sender, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultData = await spreadBep20(sender, amount, setMessage)
          
          return resolve(resultData)
        }, 1000 * index)
      })
    }))

    return spread
  }

  useEffect(() => {
    if (isValid) {
      // [BNB]
      if (token.symbol === 'BNB') {
        return spreadBnbAll().then(dataArr => {
          storeData(dataArr, resultStorageName)
          setStage('result')
        }).catch(e => console.log(e))
      }

      // [BEP20]
      spreadBep20All().then(dataArr => {
        storeData(dataArr, resultStorageName)
        setStage('result')
      }).catch(e => console.log(e))
    }
  }, [isValid])

  useEffect(() => {
    if (message) {
      setMessages([...messages, message])
      const el = LoggerDiv.current
      el.scrollTop = el.scrollHeight
    }
  }, [message])

  return (
    <>
    {!isValid && (
      <SpreadForm
        token={token}
        handleSubmit={handleSubmit}
        error={error}
        setAmount={setAmount}
        amount={amount}
        setStage={setStage}
      />
    )}

    {isValid && (
      <Logger 
        messages = {messages}
        LoggerDiv = {LoggerDiv}
      />
    )}
    </>
  )
}
