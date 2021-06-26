import { useEffect, useState, useRef } from "react"
import { WBNB, BNB, DPC, SLC, TEST2 } from "../../constant/BEP20"
import { Router } from "../../constant/Pool"
import { useBscContext } from "../../context/BscContext"
import BigNumber from "bignumber.js"

// Components
import SwapForm from "../../components/Form/SwapForm"
import Logger from "../../components/Logger/Logger"

const TOKENS = [BNB, DPC, SLC, TEST2]
export default function Setup({ data, pair, setStage }) {
  const {
    validateWallet,
    web3,
    storeData,
    swapResultStorageName,
    swapExactTokenToToken,
    swapExactBnbToToken,
    swapExactTokenToBnb,
    checkApproval,
    approve,
    checkBnbBalance,
    checkBep20Balance,
    getBalanceBnb,
    getBalanceBep20,
    calculateSwapBep20ToBep20Fee,
    calculateSwapBnbToBep20Fee,
    calculateSwapBep20ToBnbFee,
    convertToToken,
    convertToDecimal,
  } = useBscContext()
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [amount, setAmount] = useState(0)
  const [swapFromToken, setSwapFromToken] = useState("")
  const [swapToToken, setSwapToToken] = useState("")
  const [token0, setToken0] = useState(TOKENS.find((token) => token.address === pair.token0))
  const [token1, setToken1] = useState(TOKENS.find((token) => token.address === pair.token1))
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const LoggerDiv = useRef()

  // handle submit
  const handleSubmit = function (e) {
    e.preventDefault()

    const { amount_inp, from_token_inp } = e.target.elements
    // const amount = amount_inp.value
    const from_token_addr = from_token_inp.value

    // Check amount
    // if (parseFloat(amount) === 0) {
    //   return setError("Can not swap with amount of 0")
    // }

    // Check token is existence
    const fromToken = TOKENS.find((token) => token.address === from_token_addr)
    if (!fromToken) {
      return setError(`Can not swap from invalid token. ${from_token_addr}`)
    }

    setSwapFromToken(fromToken)
    // setAmount(parseFloat(amount))
    setError("")
    setIsValid(true)
  }

  // Validate approval
  const validateApproval = async function (fromWallet) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(fromWallet.address, Router.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      if (swapFromToken.symbol !== "BNB") {
        // Check approval swapFromToken
        let { approved: approved0, error: approval0Error } = await checkApproval(
          fromWallet,
          swapFromToken,
          Router.address
        )
        if (approval0Error) {
          return { error: approval0Error }
        }

        if (!approved0) {
          await approve(fromWallet, swapFromToken, Router.address)
        }
      } 
      else {
        let { approved: approved1, error: approval1Error } = await checkApproval(
          fromWallet,
          swapToToken,
          Router.address
        )
        if (approval1Error) {
          return { error: approval1Error }
        }

        if (!approved1) {
          await approve(fromWallet, swapToToken, Router.address)
        }
      }

      // if (swapToToken.symbol !== "BNB") {
        // Check approval swapToToken
      // }

      return { valid: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Validation for swapB2B
  async function swapB2B_validation(fromWallet, amount) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(fromWallet.address, Router.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Get balance Bnb
      const { error: bnbError } = await getBalanceBnb(fromWallet.address)
      if (bnbError) {
        return { error: bnbError }
      }

      // Get total gas fee
      let gasFee = 0
      if (swapFromToken.symbol === "BNB") {
        gasFee = await calculateSwapBnbToBep20Fee(fromWallet, swapToToken, amount)
      } else {
        gasFee = await calculateSwapBep20ToBep20Fee(fromWallet, swapFromToken, amount, swapToToken)
      }
      if (gasFee.error) {
        return { error: gasFee.error }
      }

      // Check balanceBnb >  gas Fee
      const { error: invalidBnb } = await checkBnbBalance(
        fromWallet,
        web3.utils.fromWei(gasFee.toString(), "ether")
      )
      if (invalidBnb) {
        return { error: invalidBnb }
      }

      // Get balanceBep20
      const { error: bep20Err } = await getBalanceBep20(fromWallet.address, swapFromToken)
      if (bep20Err) {
        return { error: bep20Err }
      }

      // Check balanceBep20
      const { error: invalidBep20 } = await checkBep20Balance(fromWallet, amount, swapFromToken)
      if (invalidBep20) {
        return { error: invalidBep20 }
      }

      return { valid: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Validation for Swap from bnb to bep20
  async function swapBnb2Bep20_validation(fromWallet, amount) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(fromWallet.address, Router.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Get balance Bnb
      const { error: bnbError } = await getBalanceBnb(fromWallet.address)
      if (bnbError) {
        return { error: bnbError }
      }

      // Get total gas fee
      let gasFee = await calculateSwapBnbToBep20Fee(fromWallet, swapToToken, amount)
      if (gasFee.error) {
        return { error: gasFee.error }
      }

      // Check balanceBnb >  gas Fee
      const { error: invalidBnb } = await checkBnbBalance(
        fromWallet,
        web3.utils.fromWei(gasFee.toString(), "ether")
      )
      if (invalidBnb) {
        return { error: invalidBnb }
      }

      return { valid: true }
    } catch (error) {
      console.log(error)
      return { error: error.message }
    }
  }

  // Validation for Swap from bnb to bep20
  async function swapBep20ToBnb_validation(fromWallet, amount) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(fromWallet.address, Router.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Get balance Bnb
      const { error: bnbError } = await getBalanceBnb(fromWallet.address)
      if (bnbError) {
        return { error: bnbError }
      }

      // Get total gas fee
      let gasFee = await calculateSwapBep20ToBnbFee(fromWallet, swapFromToken, amount)
      if (gasFee.error) {
        return { error: gasFee.error }
      }

      // Check balanceBnb >  gas Fee
      const { error: invalidBnb } = await checkBnbBalance(
        fromWallet,
        web3.utils.fromWei(gasFee.toString(), "ether")
      )
      if (invalidBnb) {
        return { error: invalidBnb }
      }

      // Get balanceBep20
      const { error: bep20Err } = await getBalanceBep20(fromWallet.address, swapFromToken)
      if (bep20Err) {
        return { error: bep20Err }
      }

      // Check balanceBep20
      const { error: invalidBep20 } = await checkBep20Balance(fromWallet, amount, swapFromToken)
      if (invalidBep20) {
        return { error: invalidBep20 }
      }

      return { valid: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Swap BEP20 to BEP20
  async function swapB2B(fromWallet, amount, setMessage) {
    const to_token = token0.address === swapFromToken.address ? token1 : token0
    fromWallet.from_token = swapFromToken.symbol
    fromWallet.to_token = to_token.symbol
    fromWallet.from_amount = amount
    fromWallet.to_amount = 0
    try {
      // Get balanceBep20
      const { error: bep20Err, balanceBep20 } = await getBalanceBep20(fromWallet.address, swapFromToken)
      if (bep20Err) {
        setMessage(
          `Sending ${amount} ${swapFromToken.symbol} to ${fromWallet.address}. --- [FAIL] ${bep20Err}`
        )
        return { ...fromWallet, error: bep20Err }
      }
      // Swap all if balance is undefined
      let amountToTransfer = (!amount) ? convertToToken(balanceBep20.toString(), swapFromToken.decimal) : amount
      fromWallet.from_amount = amountToTransfer.toString()

      // Validate
      const { valid, error: invalidError } = await swapB2B_validation(fromWallet, amountToTransfer)
      if (invalidError || !valid) {
        setMessage(
          `Sending ${amount} ${swapFromToken.symbol} to ${fromWallet.address}. --- [FAIL] ${invalidError}`
        )
        return { ...fromWallet, error: invalidError }
      }
      
      // Swap Bep20 to Bep20
      const { receipt, error: txError } = await swapExactTokenToToken(
        fromWallet,
        swapFromToken,
        amountToTransfer,
        to_token
      )
      if (txError) {
        setMessage(
          `Swapping ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. --- [FAIL] ${txError}`
        )
        return { ...fromWallet, error: txError }
      }

      // SUCCESS
      if (receipt.status === true) {
        // Loop into logs
        receipt.logs.forEach((r) => {
          // Find the log of to_token address that returning the swap value.
          if (
            web3.utils.toChecksumAddress(r.address) ===
            web3.utils.toChecksumAddress(swapToToken.address)
          ) {
            fromWallet.to_amount = convertToToken(
              web3.eth.abi.decodeParameter("uint256", r.data),
              swapToToken.decimal
            )
          }
        })
        setMessage(
          `Swapping ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. -- [SUCCESS]`
        )
        return { ...fromWallet, hash: receipt && receipt.transactionHash }
      } else {
        setMessage(
          `Swapping ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. -- [FAIL] Transaction reverted.`
        )
        return {
          ...fromWallet,
          hash: receipt && receipt.transactionHash,
          error: "Transaction reverted.",
        }
      }
      // }
    } catch (err) {
      setMessage(
        `Swapping ${amount} ${swapFromToken.symbol}  to ${fromWallet.address}. -- [FAIL] ${err.message}`
      )
      return { ...fromWallet, error: err.message }
    }
  }

  // Swap exact bnb to Bep20
  async function swapBnbToBep20(fromWallet, amount, setMessage) {
    const to_token = token0.address === swapFromToken.address ? token1 : token0
    fromWallet.from_token = swapFromToken.symbol
    fromWallet.to_token = to_token.symbol
    fromWallet.from_amount = amount
    fromWallet.to_amount = 0
    try {
      // Get balance Bnb
      const { error: bnbError, balanceBnb } = await getBalanceBnb(fromWallet.address)
      if (bnbError) {
        setMessage(
          `Sending ${amount} ${swapFromToken.symbol} to ${fromWallet.address}. --- [FAIL] ${bnbError}`
        )
        return { ...fromWallet, error: bnbError }
      }
      // Swap all if balance is undefined
      let amountToTransfer = (!amount) ? web3.utils.fromWei(balanceBnb.toString(), 'ether') : amount
      fromWallet.from_amount = amountToTransfer.toString()


      // Validate
      const { valid, error: invalidError } = await swapBnb2Bep20_validation(fromWallet, amountToTransfer)
      if (invalidError || !valid) {
        setMessage(
          `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. --- [FAIL] ${invalidError}`
        )
        return { ...fromWallet, error: invalidError }
      }

      // // Validate approval
      // const { valid: approved, error: approvalError } = await validateApproval(fromWallet)
      // if (approvalError) {
      //   return { ...fromWallet, error: approvalError }
      // }

      // if (approved) {
        // Swap Bnb to Bep20
        const { receipt, error: txError } = await swapExactBnbToToken(
          fromWallet,
          swapToToken,
          amountToTransfer
        )
        if (txError) {
          setMessage(
            `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. --- [FAIL] Transaction reverted`
          )
          return { ...fromWallet, error: txError }
        }

        // SUCCESS
        if (receipt.status === true) {
          // Loop into logs
          receipt.logs.forEach((r) => {
            // Find the log of to_token address that returning the swap value.
            if (
              web3.utils.toChecksumAddress(r.address) ===
              web3.utils.toChecksumAddress(swapToToken.address)
            ) {
              fromWallet.to_amount = convertToToken(
                web3.eth.abi.decodeParameter("uint256", r.data),
                swapToToken.decimal
              )
            }
          })
          setMessage(
            `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. -- [SUCCESS]`
          )
          return { ...fromWallet, hash: receipt && receipt.transactionHash, error: txError }
        } else {
          setMessage(
            `Swapping ${amount} ${swapFromToken.symbol} to [${swapToToken.symbol}]. -- [FAIL]Transaction reverted.`
          )
          return {
            ...fromWallet,
            hash: receipt && receipt.transactionHash,
            error: "Transaction reverted.",
          }
        }
      // }
    } catch (err) {
      setMessage(
        `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. -- [FAIL] ${err.message}`
      )
      return { ...fromWallet, error: err.message }
    }
  }

  // Swap exact Bep20 to bnb
  async function swapBep20ToBnb(fromWallet, amount, setMessage) {
    fromWallet.from_token = swapFromToken.symbol
    fromWallet.to_token = swapToToken.symbol
    fromWallet.from_amount = amount
    fromWallet.to_amount = 0
    try {
      // Get balanceBep20
      const { error: bep20Err, balanceBep20 } = await getBalanceBep20(fromWallet.address, swapFromToken)
      if (bep20Err) {
        setMessage(
          `Sending ${amount} ${swapFromToken.symbol} to ${fromWallet.address}. --- [FAIL] ${bep20Err}`
        )
        return { ...fromWallet, error: bep20Err }
      }
      // Swap all if balance is undefined
      let amountToTransfer = (!amount) ? convertToDecimal(balanceBep20.toString(), swapFromToken.decimal) : amount
      fromWallet.from_amount = amountToTransfer.toString()

      // Validate balance and address
      const { valid, error: invalidError } = await swapBep20ToBnb_validation(fromWallet, amountToTransfer)
      if (invalidError || !valid) {
        setMessage(
          `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. --- [FAIL] ${invalidError}`
        )
        return { ...fromWallet, error: invalidError }
      }

      // if (approved) {
        // Swap Bep20 to Bnb
        const { receipt, error: txError } = await swapExactTokenToBnb(
          fromWallet,
          swapFromToken,
          amountToTransfer
        )
        if (txError) {
          setMessage(
            `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. --- [FAIL] Transaction reverted`
          )
          return { ...fromWallet, error: txError }
        }

        // SUCCESS
        if (receipt.status === true) {
          // Loop into logs
          receipt.logs.forEach((r) => {
            // Find the log of to_token address that returning the swap value.
            if (
              web3.utils.toChecksumAddress(r.address) ===
              web3.utils.toChecksumAddress(swapToToken.address)
            ) {
              fromWallet.to_amount = convertToToken(
                web3.eth.abi.decodeParameter("uint256", r.data),
                swapToToken.decimal
              )
            }
          })
          setMessage(
            `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. -- [SUCCESS]`
          )
          return { ...fromWallet, hash: receipt && receipt.transactionHash, error: txError }
        } else {
          setMessage(
            `Swapping ${amount} ${swapFromToken.symbol} to [${swapToToken.symbol}]. -- [FAIL]Transaction reverted.`
          )
          return {
            ...fromWallet,
            hash: receipt && receipt.transactionHash,
            error: "Transaction reverted.",
          }
        }
      // }
    } catch (err) {
      setMessage(
        `Swapping ${amount} [${swapFromToken.symbol}] to [${swapToToken.symbol}]. -- [FAIL] ${err.message}`
      )
      return { ...fromWallet, error: err.message }
    }
  }

  // Timeout
  async function swapB2BFromAll() {
    const swapResult = await Promise.all(
      data.map((sender, index) => {
        return new Promise(async (resolve) => {
          setTimeout(async () => {
            // Validate approval
            const { valid: approved, error: approvalError } = await validateApproval(sender)
            if (approvalError) {
              return resolve({ ...sender, error: approvalError })
            }

            console.log('approve' + index)
          }, 50 * index)

          setTimeout(() => {
            console.log('WAIT')
            setTimeout(async () => {
              console.log(index)
              return resolve(await swapB2B(sender, sender.amount,setMessage))
            }, 10 * index)
          }, 30000)
        })
      })
    )

    return swapResult
  }

  // Timeout
  async function swapBnbToBep20FromAll() {
    const swapResult = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            // Validate approval
            const { valid: approved, error: approvalError } = await validateApproval(sender)
            if (approvalError) {
              return resolve({ ...sender, error: approvalError })
            }

          }, 50 * index)

          setTimeout(() => {
            setTimeout(async () => {
              const resultData = await swapBnbToBep20(sender, sender.amount,setMessage)
  
              return resolve(resultData)
            }, 150 * index)
          }, 40000)
        })
      })
    )

    return swapResult
  }

  // Timeout
  async function swapBep20ToBnbFromAll() {
    const swapResult = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            // Validate approval
            const { valid: approved, error: approvalError } = await validateApproval(sender)
            if (approvalError) {
              return resolve({ ...sender, error: approvalError })
            }

          }, 50 * index)

          setTimeout(() => {
            setTimeout(async () => {
              const resultData = await swapBep20ToBnb(sender, sender.amount,setMessage)
  
              return resolve(resultData)
            }, 200 * index)
          }, 40000)
        })
      })
    )

    return swapResult
  }

  useEffect(() => {
    if (isValid) {
      // [BNB] to [BEP20]
      if (swapFromToken.symbol === "BNB") {
        swapBnbToBep20FromAll()
          .then((dataArr) => {
            storeData(dataArr, swapResultStorageName)
            setStage("result")
          })
          .catch((e) => console.log(e))
        return
      }

      // [BEP20] to [WBNB]
      if (swapToToken.symbol === "BNB") {
        swapBep20ToBnbFromAll()
          .then((dataArr) => {
            storeData(dataArr, swapResultStorageName)
            setStage("result")
          })
          .catch((e) => console.log(e))
        return
      }

      if (swapFromToken.symbol !== "BNB" && swapToToken.symbol !== "BNB") {
        // [BEP20] to [BEP20]
        swapB2BFromAll()
          .then((dataArr) => {
            storeData(dataArr, swapResultStorageName)
            setStage("result")
          })
          .catch((e) => console.log(e))
      }
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
          <div className="card-header">Swap from pair [{pair.name}]</div>
          <div className="card-boy p-2">
            <SwapForm
              setStage={setStage}
              token={swapFromToken}
              setToken={setSwapFromToken}
              setSwapToToken={setSwapToToken}
              TOKENS={[token0, token1]}
              handleSubmit={handleSubmit}
              error={error}
              amount={amount}
              setAmount={setAmount}
            />
          </div>
        </>
      )}

      {isValid && <Logger messages={messages} LoggerDiv={LoggerDiv} />}
    </>
  )
}
