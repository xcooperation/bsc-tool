import React, { useState, useEffect } from "react"
import BigNumber from "bignumber.js"
import BEP20_ABI from "../../ABI/BEP20.json"
import { WBNB, DPC, SLC, BNB } from "../../constant/BEP20"
import { pairs } from "../../constant/Pair"
import { useBscContext } from "../../context/BscContext"

import AddLiquidityForm from "../../components/Form/AddLiquidityForm"
const TOKENS = [WBNB, DPC, SLC]
export default function Pair() {
  const { web3, getWalletByPK, checkCreatingFee, addLiquidity, createPair, addLiquidityByBNB } = useBscContext()
  const [pool, setPool] = useState("")
  const [token0, setToken0] = useState("")
  const [token1, setToken1] = useState("")
  const [mainWallet, setMainWallet] = useState({})
  const [selected, setSelected] = useState(false)

  const [amount0, setAmount0] = useState(0)
  const [amount1, setAmount1] = useState(0)
  const [error, setError] = useState("")
  const [doneMsg, setDoneMsg] = useState("")
  const [isValid, setIsValid] = useState(false)
  const [loading, setLoading] = useState(false)

  // handle form submit
  const handleSubmit = async function (e) {
    e.preventDefault()
    const { amount0_inp, amount1_inp } = e.target.elements

    // Check amount0
    if (parseFloat(amount0_inp.value) === 0) {
      return setError(`Amount of ${token0.symbol} must larger than 0.`)
    }
    // Check amount1
    if (parseFloat(amount1_inp.value) === 0) {
      return setError(`Amount of ${token1.symbol} must larger than 0.`)
    }

    setAmount0(parseFloat(amount0_inp.value))
    setAmount1(parseFloat(amount1_inp.value))
    setError("")
    setIsValid(true)
    setLoading(true)
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

  // handle select
  const handleSelect = async function (e) {
    if (e.target.value) {
      const pair = pairs.find((p) => p.address === e.target.value)

      const token0 = TOKENS.find((token) => token.address === pair.token0)
      const token1 = TOKENS.find((token) => token.address === pair.token1)

      setPool(pair)
      setToken0(token0)
      setToken1(token1)
      setSelected(true)
    } else {
      setPool("")
      setToken0("")
      setToken1("")
      setSelected(false)
    }
  }

  // Add liquidity
  const addLiquidityToPool = function () {
    return new Promise(async (resolve) => {
      if(token0.symbol === 'WBNB' || token1.symbol === 'WBNB') {
        const tokenToAdd = (token0.symbol === 'WBNB') ? token1 : token0
        const amountToAdd = (token0.symbol === 'WBNB') ? amount1 : amount0
        const amountBNB = (token0.symbol === 'WBNB') ? amount0 : amount1
        const {receipt, error} = await addLiquidityByBNB(mainWallet, tokenToAdd, amountBNB, amountToAdd)
        if (error) {
          return resolve({error})
        }
  
        return resolve({txHash: receipt.transactionHash})
      } else {
        const {receipt, error} = await addLiquidity(mainWallet, token0, token1, amount0, amount1)
        if (error) {
          return resolve({error})
        }
  
        return resolve({txHash: receipt.transactionHash})
      }
    })
  }

  useEffect(() => {
    if (isValid) {
      // setLoading(true)
      addLiquidityToPool().then((result) => {
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
              <div className="card-header">Liquidity</div>
              {/* Add Form */}
              <AddLiquidityForm
                pairs={pairs}
                pool={pool}
                mainWallet={mainWallet}
                token0={token0}
                token1={token1}
                amount0={amount0}
                setAmount0={setAmount0}
                amount1={amount1}
                setAmount1={setAmount1}
                error={error}
                handleSelect={handleSelect}
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
