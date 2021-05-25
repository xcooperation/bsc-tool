import { useEffect, useState, useRef } from "react"
import { useBscContext } from "../../context/BscContext"
import BigNumber from 'bignumber.js'

// Components
import SpreadForm from "../../components/Form/SpreadForm"
import Logger from "../../components/Logger/Logger"

export default function Spread({ data, token, setStage, amount, setAmount, setMainWallet, mainWallet }) {
  const { checkBnbBalance, web3, getWalletByPK, storeData, resultStorageName, sendBNB, validateWallet } = useBscContext()
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
      const totalAmount = new BigNumber(data.length).multipliedBy(amount)
      const { error, sufficient } = await checkBnbBalance(wallet, totalAmount)
      
      if (error) {
        setError(error)
      } else if (sufficient) {
        setIsValid(true)
      }
    } catch (error) {
      setError(error)
    }
  }

  // Validate 
  async function validation(wallet, amountOfEther) {
    try {
      // Check format address
      const validFormat = validateWallet(wallet.address)
      if (!validFormat) {
        return {error: 'Invalid address.'}
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

  // Spread BNB
  async function spreadBnb (cloneWallet, amountOfEther, setMessage) {
    try {
      // Validate
      const {valid, error: invalidError} = await validation(cloneWallet, amountOfEther, 'spread')
      if (invalidError || !valid) {
        setMessage(`Sending ${amountOfEther} ${token} to ${cloneWallet.address}. --- [FAIL] ${invalidError}`)
        return {...cloneWallet, error: invalidError}
      }
      // Send Bnb
      const {receipt, error: txError} = await sendBNB(mainWallet, cloneWallet.address, amountOfEther)
      if (txError) {
        setMessage(`Sending ${amountOfEther} ${token} to ${cloneWallet.address}. --- [FAIL] ${txError}`)
        return {...cloneWallet, error: txError}
      }

      // SUCCESS
      if (receipt) {
        setMessage(`Sending ${amountOfEther} ${token} to ${cloneWallet.address}. -- [SUCCESS]`)
        return {...cloneWallet, hash: receipt.transactionHash}
        
      }

    } catch (err) {
      setMessage(`Sending ${amountOfEther} ${token} to ${cloneWallet.address}. -- [FAIL] ${err.message}`)
      return {...cloneWallet, error: err.message}
    }
    
  }

  // [SPREAD]
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

  useEffect(() => {
    if (isValid) {
      // [SPREAD]
      spreadBnbAll().then(dataArr => {
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
