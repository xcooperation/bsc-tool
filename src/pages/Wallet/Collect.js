import { useEffect, useState, useRef } from "react"
import { useBscContext } from "../../context/BscContext"
import BigNumber from "bignumber.js"

// Components
import CollectForm from "../../components/Form/CollectForm"
import Logger from "../../components/Logger/Logger"

export default function Collect({ data, token, setStage, setMainWallet, mainWallet }) {
  const {
    validateWallet,
    web3,
    storeData,
    resultStorageName,
    sendBNB,
    checkBnbBalance,
    getBalanceBnb,
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

    const valid = validateWallet(wallet_address)

    if (!valid) {
      return setError(error)
    }

    setError("")
    setMainWallet({ address: wallet_address })
    setIsValid(true)
  }

  // Validate
  async function validation(wallet, amountOfEther) {
    try {
      // Check format address
      const validFormat = validateWallet(wallet.address)
      if (!validFormat) {
        return { error: "Invalid address." }
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
      const { valid, error: invalidError } = await validation(cloneWallet, amountOfEther)
      if (invalidError || !valid) {
        setMessage(
          `Collect ${amountOfEther} ${token} from ${cloneWallet.address}. --- [FAIL] ${invalidError}`
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
          `Collect ${amountOfEther} ${token} to ${cloneWallet.address}. --- [FAIL] ${txError}`
        )
        return { ...cloneWallet, error: txError }
      }

      console.log(txError, 3)
      // SUCCESS
      if (receipt) {
        setMessage(`Collect ${amountOfEther} ${token} to ${cloneWallet.address}. -- [SUCCESS]`)
        return { ...cloneWallet, hash: receipt.transactionHash }
      }
    } catch (err) {
      setMessage(
        `Collect ${amountOfEther} ${token} to ${cloneWallet.address}. -- [FAIL] ${err.message}`
      )
      return { ...cloneWallet, error: err.message }
    }
  }

  // [COLLECT]
  async function collectBnbAll() {
    const collect = await Promise.all(
      data.map((sender, index) => {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const resultData = await collectBnb(sender, sender.amount, setMessage)

            return resolve(resultData)
          }, 1000 * index)
        })
      })
    )

    return collect
  }

  useEffect(() => {
    if (isValid) {
      // [COLLECT]
      collectBnbAll()
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
