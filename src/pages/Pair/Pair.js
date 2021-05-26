import React, { useState, useEffect } from "react"
import BEP20_ABI from "../../ABI/BEP20.json"
import { WBNB, DPC, SLC } from "../../constant/BEP20"
import { useBscContext } from "../../context/BscContext"

import PairForm from "../../components/Form/PairForm"

export default function Pair() {
  const { web3, getWalletByPK, checkCreatingFee, createPair } = useBscContext()
  const [mainWallet, setMainWallet] = useState({})
  const [token0] = useState(WBNB)
  const [token1, setToken1] = useState(null)
  const [error, setError] = useState("")
  const [doneMsg, setDoneMsg] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  // handle form submit
  const handleSubmit = async function (e) {
    e.preventDefault()

    setError("")
    setIsValid(true)
    setLoading(true)
  }

  // Get token from address
  const handleToken = async function (e) {
    const address = e.target.value
    try {
      const contractInstance = new web3.eth.Contract(BEP20_ABI, address)
      if (contractInstance.methods) {
        const token = {
          address,
          decimal: parseInt(await contractInstance.methods.decimals().call()),
          name: await contractInstance.methods.name().call(),
          symbol: await contractInstance.methods.symbol().call(),
          ABI: BEP20_ABI,
        }

        setToken1(token)
        setError("")
        return
      }

      setToken1(null)
      setError("")
    } catch (error) {
      setToken1(null)
      setError("Not a token's address.")
    }
  }

  // Handle private key
  const handlePK = function (PK) {
    try {
      if (PK) {
        const { wallet } = getWalletByPK(PK)
        if (wallet) {
          setMainWallet(wallet)
          setError("")
          return
        }
      }

      setError("Private key is not valid.")
    } catch (error) {
      setError("Private key is not valid.")
    }
  }

  // Create pair
  const createPairExchange = async function (wallet, token0, token1) {
    try {
      // Check balance
      const { sufficient, error } = await checkCreatingFee(wallet, token0, token1)
      if (error) {
        return { error }
      }

      if (!sufficient) {
        return {error: `Insufficient balance.`}
      }
      // Send to factory
      const { receipt, error: createError } = await createPair(wallet, token0, token1)
      if (createError) {
        return { error: createError }
      }
console.log(receipt)
      return { txHash: receipt.transactionHash }
    } catch (error) {
      return { error: error.message }
    }
  }

  // create exchange pair
  function createExchangePair() {
    return new Promise(async (resolve) => {
      const result = await createPairExchange(mainWallet, token0, token1)
      return resolve(result)
    })
  }

  useEffect(() => {
    if (isValid) {
      createExchangePair().then((result) => {
        const { txHash, error } = result
        if (error) {
          setError(error)
          setDoneMsg("")
        } else {
          setError("")
          setDoneMsg(txHash)
        }
        setLoading(false)
      })
    }
  }, [isValid])

  return (
    <>
      <div className="container-fluid">
        <div className="d-flex justify-content-center">
          <div className="col-9 my-3">
            <div className="card">
              <div className="card-header">Create exchange pair</div>
              {/* Form */}
              <PairForm
                mainWallet={mainWallet}
                token={token1}
                error={error}
                handleToken={handleToken}
                handlePK={handlePK}
                handleSubmit={handleSubmit}
              />

              {loading && (
                <div className="text-center">
                  <div
                    className="spinner-border"
                    role="status"
                    style={{ width: "3rem", height: "3rem" }}
                  ></div>
                </div>
              )}

              {doneMsg && (
                <div className="alert-wrapper px-4">
                  <div className="alert alert-success" role="alert">
                    {doneMsg}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
