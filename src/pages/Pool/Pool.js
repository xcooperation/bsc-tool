import React, { useState, useEffect } from "react"
import BigNumber from "bignumber.js"
import { pairs } from "../../constant/Pair"
import { BNB, DPC, SLC, WBNB } from "../../constant/BEP20"
import { useBscContext } from "../../context/BscContext"

import PoolForm from "../../components/Form/PoolForm"
import Data from "./Data"

const TOKENS = [BNB, DPC, SLC, WBNB]
export default function Pool() {
  const { web3, convertToToken, removeData, swapStorageName } = useBscContext()
  const [pool, setPool] = useState("")
  const [token0, setToken0] = useState("")
  const [token1, setToken1] = useState("")
  const [reserve0, setReserve0] = useState(0)
  const [reserve1, setReserve1] = useState(0)
  const [price0, setPrice0] = useState(0)
  const [price1, setPrice1] = useState(0)
  const [selected, setSelected] = useState(false)

  // handle selecting pair
  const handleSelect = async function (e) {
    if (e.target.value) {
      const pair = pairs.find((p) => p.address === e.target.value)

      const token0 = TOKENS.find((token) => token.address === pair.token0)
      const token1 = TOKENS.find((token) => token.address === pair.token1)

      const reserves = await getReserve(pair, token0, token1)
      const prices = await getPrices(reserves[0], reserves[1])
      setReserve0(reserves[0])
      setReserve1(reserves[1])
      setPrice0(prices.pricePer0)
      setPrice1(prices.pricePer1)
      setPool(pair)
      setToken0(token0)
      setToken1(token1)
      setSelected(true)
    } else {
      setPool(null)
      setToken0(null)
      setToken1(null)
      setSelected(false)
    }
  }

  // get reserve from pool
  const getReserve = async function (pair, token0, token1) {
    try {
      const contractInstance = new web3.eth.Contract(pair.ABI, pair.address)
      const reserves = await contractInstance.methods.getReserves().call()

      return [convertToToken(reserves[0], token0.decimal).toString(), convertToToken(reserves[1], token1.decimal).toString()]
    } catch (error) {
      return null
    }
  }

  // get prices
  const getPrices = function (reserve0, reserve1) {
    // Prices
    let pricePer0 = new BigNumber(reserve1).dividedBy(reserve0)
    pricePer0 = pricePer0.minus(pricePer0.multipliedBy(0.2 / 100))
    let pricePer1 = new BigNumber(reserve0).dividedBy(reserve1)
    pricePer1 = pricePer1.minus(pricePer1.multipliedBy(0.2 / 100))
    return { pricePer0: pricePer0.toString(), pricePer1: pricePer1.toString() }
  }

  return (
    <>
      <div className="container-fluid">
        <div className="d-flex justify-content-center">
          {/* Initial */}
            <div className="col-8 my-3">
              <div className="card">
                <div className="card-header">Pool</div>
                {/* Form */}
                <PoolForm pairs={pairs} handleSelect={handleSelect} pool={pool} />

                {selected && (
                  <>
                    {/* Info */}
                    <Data
                      token0={token0}
                      token1={token1}
                      reserve0={reserve0}
                      reserve1={reserve1}
                      pricePer0={price0}
                      pricePer1={price1}
                    />
                  </>
                )}
              </div>
            </div>
        </div>
      </div>
    </>
  )
}
