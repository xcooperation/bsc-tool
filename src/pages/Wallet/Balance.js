import { useState, useEffect, useRef } from "react"
import { useBscContext } from "../../context/BscContext"

import Logger from '../../components/Logger/Logger'

export default function Balance({ 
  data, token, setStage,
}) {
  const { getBalanceBnb, web3, storeData, resultStorageName } = useBscContext()
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

  // [BALANCE]
  async function balanceBnbAll() {
    const balance = await Promise.all(data.map((sender, index) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const resultData = await balanceBnb(sender, setMessage)
          
          return resolve(resultData)
        }, 1000 * index)
      })
    }))

    return balance
  }

  useEffect(() => {
    // [BALANCE]
    balanceBnbAll().then(dataArr => {
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
