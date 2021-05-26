import React, { useState, useEffect } from "react"
import BigNumber from "bignumber.js"
import { pairs } from "../../constant/Pair"
import { BNB, DPC, SLC } from "../../constant/BEP20"
import { useBscContext } from "../../context/BscContext"

import PoolForm from "../../components/Form/PoolForm"
import Data from "./Data"

const TOKENS = [BNB, DPC, SLC]
export default function Pool() {
  const { web3, convertToToken, removeData, swapStorageName } = useBscContext()
  const [pool, setPool] = useState(null)
  const [token0, setToken0] = useState(null)
  const [token1, setToken1] = useState(null)
  const [prices, setPrices] = useState({ pricePer0: 0, pricePer1: 0 })
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    if (selected) {
      async function setData() {
        await getReserve(pool, token0, token1)
      }

      setData()
    }
  }, [selected])

  useEffect(() => {
    if (token0 && token1) {
      getPrices()
    }
  }, [token0, token1])

  // handle selecting pair
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

      setToken0({ ...token0, reserve: convertToToken(reserves[0], token0.decimal).toString() })
      setToken1({ ...token1, reserve: convertToToken(reserves[1], token1.decimal).toString() })
    } catch (error) {
      setToken0({ ...token0, reserve: 0 })
      setToken1({ ...token1, reserve: 0 })
      setPrices({ pricePer0: 0, pricePer1: 0 })
    }
  }

  // get prices
  const getPrices = function () {
    // Prices
    let pricePer0 = new BigNumber(token1.reserve).dividedBy(token0.reserve)
    pricePer0 = pricePer0.minus(pricePer0.multipliedBy(0.2 / 100))
    let pricePer1 = new BigNumber(token0.reserve).dividedBy(token1.reserve)
    pricePer1 = pricePer1.minus(pricePer1.multipliedBy(0.2 / 100))
    setPrices({ pricePer0: pricePer0.toString(), pricePer1: pricePer1.toString() })
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
                      pricePer0={prices.pricePer0}
                      pricePer1={prices.pricePer1}
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
