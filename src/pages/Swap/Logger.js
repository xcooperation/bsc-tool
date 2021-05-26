import { useEffect, useState, useRef } from "react"
import { BNB, DPC, SLC } from "../../constant/BEP20"
import { Router } from "../../constant/Pool"
import { useBscContext } from "../../context/BscContext"
import BigNumber from "bignumber.js"

// Components
import SwapForm from "../../components/Form/SwapForm"
import Logger from "../../components/Logger/Logger"

const TOKENS = [BNB, DPC, SLC]
export default function Setup({ data, pair, setStage }) {
  const {
    validateWallet,
    web3,
    storeData,
    swapResultStorageName,
    swapTokenToToken,
    checkBnbBalance,
    checkBep20Balance,
    getBalanceBnb,
    getBalanceBep20,
    calculateBEP20Fee,
    convertToToken
  } = useBscContext()
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [amount, setAmount] = useState(0)
  const [swapFromToken, setSwapFromToken] = useState(null)
  const [token0, setToken0] = useState(TOKENS.find((token) => token.address === pair.token0))
  const [token1, setToken1] = useState(TOKENS.find((token) => token.address === pair.token1))
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const LoggerDiv = useRef()

  // handle submit
  const handleSubmit = function (e) {
    e.preventDefault()
    
    const { amount_inp, from_token_inp } = e.target.elements
    const amount = amount_inp.value
    const from_token_addr = from_token_inp.value
    
    // Check amount
    if (parseFloat(amount) === 0) {
      return setError("Can not swap with amount of 0")
    }

    // Check token is existence
    const fromToken = TOKENS.find((token) => token.address === from_token_addr)
    if (!fromToken) {
      return setError("Can not swap with invalid token.")
    }

    setSwapFromToken(fromToken)
    setAmount(parseFloat(amount))
    setError("")
    setIsValid(true)
  }

  // Validation for swapB2B
  async function swapB2B_validation(fromWallet, amount) {
    try {
       // Check address
       const {error: invalidFormat} = validateWallet(fromWallet.address, Router.address)
       if (invalidFormat) {
         return { error: invalidFormat }
       }
 
       // Get balance Bnb
       const {error: bnbError} = await getBalanceBnb(fromWallet.address)
       if (bnbError) {
         return {error: bnbError}
       }
 
       // Get gas price
       const gasFee = await calculateBEP20Fee(swapFromToken, fromWallet, Router.address, amount)
       if (gasFee.error) {
        return {error: gasFee.error}
       }
       // Check balanceBnb >  gas Fee
       const {error: invalidBnb} = await checkBnbBalance(fromWallet, web3.utils.fromWei(gasFee.toString(), 'ether'))
       if (invalidBnb) {
         return {error: invalidBnb}
       }
 
       // Get balanceBep20
       const {error: bep20Err} = await getBalanceBep20(fromWallet.address, swapFromToken)
       if(bep20Err) {
         return {error: bep20Err}
       }
 
       // Check balanceBep20
       const {error: invalidBep20} = await checkBep20Balance(fromWallet, amount, swapFromToken)
       if (invalidBep20) {
         return {error: invalidBep20}
       }
       
       return {valid: true}
     } catch (error) {
       console.log(error)
       return {error: error.message}
     }
  }

  // Swap BEP20 to BEP20
  async function swapB2B(fromWallet, setMessage) {
    fromWallet.from_token = swapFromToken.symbol
    fromWallet.to_token = (token0.address === swapFromToken.address) ? token1.symbol : token0.symbol
    try {
      // Validate
      const {valid, error: invalidError} = await swapB2B_validation(fromWallet, amount)
      if (invalidError || !valid) {
        setMessage(`Sending ${amount} ${swapFromToken.symbol} to ${fromWallet.address}. --- [FAIL] ${invalidError}`)
        return {...fromWallet, error: invalidError}
      }

      // Swap Bep20 to Bep20
      const {receipt, error: txError} = await swapTokenToToken(fromWallet, swapFromToken, amount, [token0, token1])
      if (txError) {
        setMessage(`Sending ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. --- [FAIL] Transaction reverted`)
        return {...fromWallet, error: txError}
      }

      // SUCCESS
      if (receipt) {
        setMessage(`Sending ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. -- [SUCCESS]`)
        return {...fromWallet, hash: (receipt) && receipt.transactionHash, error: txError}
      }

    } catch (err) {
      setMessage(`Sending ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. -- [FAIL] ${err.message}`)
      return {...fromWallet, error: err.message}
    }
  }
  
  // Timeout 
  async function swapB2BFromAll() {
    const swapResult = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const resultData = await swapB2B(sender, setMessage)
            
            return resolve(resultData)
          }, 500 * index)
        })
      })
    )

    return swapResult
  }

  useEffect(() => {
    if (isValid) {
      // [BEP20] to [BEP20]
      swapB2BFromAll().then((dataArr) => {
        storeData(dataArr, swapResultStorageName)
        setStage("result")
      })
      .catch((e) => console.log(e))
    }
  }, [isValid])
  
  // Logging messages
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
        <>
      <div className="card-header">
        Swap from pair [{pair.name}]
      </div>
        <SwapForm
          token={swapFromToken}
          setToken={setSwapFromToken}
          TOKENS={[token0, token1]}
          handleSubmit={handleSubmit}
          error={error}
          amount={amount}
          setAmount={setAmount}
        />
        </>
      )}

      {isValid && <Logger messages={messages} LoggerDiv={LoggerDiv} />}
    </>
  )
}
