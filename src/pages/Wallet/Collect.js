import { useEffect, useState, useRef } from "react"
import { useBscContext } from "../../context/BscContext"
import BigNumber from "bignumber.js"

// Components
import CollectForm from "../../components/Form/CollectForm"
import Logger from "../../components/Logger/Logger"

const untouch_wallets = [
  "0x196C35776cF72ed607D4D1DbfFB9172921E4b4E7",
  "0x5d4f740C6CEd25774845Ade3c931AEe30f666b32",
  "0xd656ca1846bc2336e6E1905c914F97C5D936ce0d",
  "0xF0a92065596Ecd47a926F83db3B175442eB6D812",
  "0xB4eB6288c97a269b45ca36fe678739f5498c7d16",
]
export default function Collect({ data, token, setStage, setMainWallet, mainWallet }) {
  const {
    validateWallet,
    web3,
    storeData,
    resultStorageName,
    sendBNB,
    sendBEP20,
    checkBnbBalance,
    checkBep20Balance,
    getBalanceBnb,
    getBalanceBep20,
    calculateBEP20Fee,
    convertToToken,
  } = useBscContext()
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const LoggerDiv = useRef()

  // handle submit
  const handleSubmit = function (e) {
    e.preventDefault()
    const { wallet_address_inp } = e.target.elements
    const wallet_address = wallet_address_inp.value

    if (!web3.utils.isAddress(wallet_address)) {
      return setError(error)
    }

    setError("")
    setMainWallet({ address: wallet_address })
    setIsValid(true)
  }

  // BNB Validation
  async function bnbValidation(wallet, amountOfEther) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(wallet.address, mainWallet.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Check balance bnb of clone wallet
      const { error } = await checkBnbBalance(wallet, amountOfEther)
      if (error) {
        return { error }
      }

      return { valid: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // BEP20 Validation
  async function bep20Validation(wallet, amountOfEther) {
    try {
      // Check address
      const { error: invalidFormat } = validateWallet(wallet.address, mainWallet.address)
      if (invalidFormat) {
        return { error: invalidFormat }
      }

      // Get balance Bnb
      const { error: bnbError } = await getBalanceBnb(wallet.address)
      if (bnbError) {
        return { error: bnbError }
      }

      // Get gas price
      const gasFee = await calculateBEP20Fee(token, wallet, mainWallet.address, amountOfEther)

      // Check balanceBnb >  gas Fee
      const { error: invalidBnb } = await checkBnbBalance(
        wallet,
        web3.utils.fromWei(gasFee.toString(), "ether")
      )
      if (invalidBnb) {
        return { error: invalidBnb }
      }

      // Get balanceBep20
      const { error: bep20Err } = await getBalanceBep20(wallet.address, token)
      if (bep20Err) {
        return { error: bep20Err }
      }

      // Check balanceBep20
      const { error: invalidBep20 } = await checkBep20Balance(wallet, amountOfEther, token)
      if (invalidBep20) {
        return { error: invalidBep20 }
      }

      return { valid: true }
    } catch (error) {
      return { error: error.message }
    }
  }

  // Collect BNB
  async function collectBnb(cloneWallet, amountOfEther, setMessage) {
    try {
      const { balanceBnb } = await getBalanceBnb(cloneWallet.address)
      if (balanceBnb) {
        amountOfEther = amountOfEther
          ? amountOfEther
          : web3.utils.fromWei(balanceBnb.toString(), "ether")
      }

      // Validate
      const { valid, error: invalidError } = await bnbValidation(cloneWallet, amountOfEther)
      if (invalidError || !valid) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. --- [FAIL] ${invalidError}`
        )
        return { ...cloneWallet, error: invalidError }
      }

      // Send Bnb
      const { receipt, error: txError } = await sendBNB(
        cloneWallet,
        mainWallet.address,
        amountOfEther
      )
      if (txError) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. --- [FAIL] ${txError}`
        )
        return { ...cloneWallet, error: txError }
      }

      // SUCCESS
      if (receipt.status === true) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. -- [SUCCESS]`
        )
        return { ...cloneWallet, hash: receipt.transactionHash }
      } else {
        setMessage(
          `Sending ${amountOfEther} ${token.symbol}  from ${cloneWallet.address}. -- [FAILED] Transaction reverted.`
        )
        return { ...cloneWallet, hash: receipt.transactionHash, error: "Transaction reverted." }
      }
    } catch (err) {
      setMessage(
        `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. -- [FAIL] ${err.message}`
      )
      return { ...cloneWallet, error: err.message }
    }
  }

  // Collect BEP20
  async function collectBep20(cloneWallet, amountOfEther, setMessage) {
    try {
      const { balanceBep20 } = await getBalanceBep20(cloneWallet.address, token)
      if (balanceBep20) {
        amountOfEther = amountOfEther
          ? amountOfEther
          : convertToToken(balanceBep20.toString(), token.decimal)
      }

      cloneWallet.amountOfEther = amountOfEther
      // Validate
      const { valid, error: invalidError } = await bep20Validation(cloneWallet, amountOfEther)
      if (invalidError || !valid) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. --- [FAIL] ${invalidError}`
        )
        return { ...cloneWallet, error: invalidError }
      }

      // Send BEP20
      const { receipt, error: txError } = await sendBEP20(
        cloneWallet,
        mainWallet.address,
        amountOfEther,
        token
      )
      if (txError) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. --- [FAIL] ${txError}`
        )
        return { ...cloneWallet, error: txError }
      }

      // SUCCESS
      // if (true) {
      if (receipt.status === true) {
        setMessage(
          `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. -- [SUCCESS]`
        )
        return { ...cloneWallet, hash: receipt.transactionHash }
        // return { ...cloneWallet }
      } else {
        setMessage(
          `Sending ${amountOfEther} ${token.symbol}  from ${cloneWallet.address}. -- [FAILED] Transaction reverted.`
        )
        return { ...cloneWallet, hash: receipt.transactionHash, error: "Transaction reverted." }
        // return {...cloneWallet, error: 'Transaction reverted.'}
      }
    } catch (err) {
      setMessage(
        `Collect ${amountOfEther} ${token.symbol} from ${cloneWallet.address}. -- [FAIL] ${err.message}`
      )
      return { ...cloneWallet, error: err.message }
    }
  }

  // [BNB]
  async function collectBnbAll() {
    const collect = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            if (!untouch_wallets.includes(sender.address)) {
              const resultData = await collectBnb(sender, sender.amount, setMessage)
  
              return resolve(resultData)
            }
          }, 100 * index)
        })
      })
    )

    return collect
  }

  // [BEP20]
  async function collectBep20All() {
    let total_amount = 0
    const collect = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            if (!untouch_wallets.includes(sender.address)) {
              //               if (total_amount <= 10_000_000_000_000) {
              //                 const resultData = await collectBep20(sender, sender.amount, setMessage)
              //                 total_amount += parseInt(resultData.amountOfEther)
              // console.log(total_amount)
              //                 return resolve(resultData)
              //               } else {
              //                 return resolve({...sender, error: error.message})
              //               }

              const resultData = await collectBep20(sender, sender.amount, setMessage)
              console.log(total_amount)
              return resolve(resultData)
            }
            
            return resolve(sender)
          }, 100 * index)
        })
      })
    )

    return collect
  }

  useEffect(() => {
    if (isValid) {
      if (token.symbol === "BNB") {
        // [BNB]
        return collectBnbAll()
          .then((dataArr) => {
            storeData(dataArr, resultStorageName)
            setStage("result")
          })
          .catch((e) => console.log(e))
      }

      // [BEP20]
      collectBep20All()
        .then((dataArr) => {
          storeData(dataArr, resultStorageName)
          setStage("result")
        })
        .catch((e) => console.log(e))
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
        <CollectForm
          setStage={setStage}
          token={token}
          handleSubmit={handleSubmit}
          error={error}
          mainWallet={mainWallet}
          setMainWallet={setMainWallet}
        />
      )}

      {isValid && <Logger messages={messages} LoggerDiv={LoggerDiv} />}
    </>
  )
}
