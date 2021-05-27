import { useState, useEffect, useRef } from "react"
import { useBscContext } from "../../context/BscContext"

import Logger from '../../components/Logger/Logger'

export default function Balance({ 
  data, token, setStage,
}) {
  const { getBalanceBep20, getBalanceBnb, web3, storeData, resultStorageName, convertToToken } = useBscContext()
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const LoggerDiv  = useRef()

  // Get balance Bnb
  async function balanceBnb (cloneWallet, setMessage) {
    try {
      const {balanceBnb: balance, error} = await getBalanceBnb(cloneWallet.address)
      if (error) {
        setMessage(`[${cloneWallet.address}] --- Failed to get balance`)
      }

      setMessage(`[${cloneWallet.address}] --- ${web3.utils.fromWei(balance.toString(), 'ether')} BNB`)
      return {...cloneWallet, BNB: web3.utils.fromWei(balance.toString(), 'ether')}
    } catch (error) {
      return {error: error.message}
    }
  }

  // Get balance Bep20
  async function balanceBep20 (cloneWallet, setMessage) {
    try {
      const {balanceBep20: balance, error} = await getBalanceBep20(cloneWallet.address, token)
      if (error) {
        setMessage(`[${cloneWallet.address}] --- Failed to get balance`)
      }
      const convertedBalance = convertToToken(balance.toString(),token.decimal).toString()
      setMessage(`[${cloneWallet.address}] --- ${convertedBalance} ${token.symbol}`)
      return {...cloneWallet, [token.symbol]: convertedBalance}
    } catch (error) {
      return {error: error.message}
    }
  }

  // [BALANCE - BNB]
  async function balanceBnbAll() {
    const balance = await Promise.all(data.map((sender, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultData = await balanceBnb(sender, setMessage)
          
          return resolve(resultData)
        }, 10 * index)
      })
    }))

    return balance
  }

  // [BALANCE - BEP20]
  async function balanceBep20All () {
    const balance = await Promise.all(data.map((sender, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultData = await balanceBep20(sender, setMessage)
          
          return resolve(resultData)
        }, 10 * index)
      })
    }))

    return balance
  }

  useEffect(() => {
    if (token.symbol === 'BNB') {
      // [BNB]
      return balanceBnbAll().then(dataArr => {
        storeData(dataArr, resultStorageName)
        setStage('result')
      }).catch(e => console.log(e))
    }

    // [BEP20]
    return balanceBep20All().then(dataArr => {
      storeData(dataArr, resultStorageName)
      setStage('result')
    }).catch(e => console.log(e))
  }, [])

  useEffect(() => {
    if (message) {
      setMessages([...messages, message])
      const el = LoggerDiv.current
      el.scrollTop = el.scrollHeight
    }
  }, [message])

  return (
    <>
      <Logger 
        messages = {messages}
        LoggerDiv = {LoggerDiv}
      />
    </>
  )
}
