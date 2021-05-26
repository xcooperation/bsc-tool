import BigNumber from "bignumber.js"
import React from "react"

export default function Data({ token0, token1, pricePer0, pricePer1 }) {
  return (
    <>
    {/* DIVIDER */}
    <div className="px-4">
      <hr data-content="Reserve" className="hr-text" />
    </div>

    <div className="mb-2">
      <div className="p-2 px-3">
        <div className="input-group-prepend">
          <div className="input-group-text mr-2">{token0.symbol}</div>
          <input 
            className="form-control text-right" 
            type="text" 
            name="token0" 
            value={token0.reserve}
            disabled />
        </div>
      </div>

      <div className="p-2 px-3">
        <div className="input-group-prepend">
          <div className="input-group-text mr-2">{token1.symbol}</div>
          <input 
            className="form-control text-right" 
            type="text" 
            name="token1" 
            value={token1.reserve}
            disabled />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="px-4">
        <hr data-content="Price" className="hr-text" />
      </div>

      {/* PRiCE */}
      <div className="p-2 px-3">
        <div className="input-group-prepend">
          <div className="input-group-text">1</div>
          <div className="input-group-text ml-2">{token0.symbol}</div>
          <div className="input-group-text ml-2">=</div>
          <input 
            className="form-control mx-2" 
            type="text" 
            name="price_per_token0" 
            value={pricePer0.toString()}
            disabled />
          <div className="input-group-text">{token1.symbol}</div>
        </div>
      </div>

      <div className="p-2 px-3">
        <div className="input-group-prepend">
          <div className="input-group-text">1</div>
          <div className="input-group-text ml-2">{token1.symbol}</div>
          <div className="input-group-text ml-2">=</div>
          <input 
            className="form-control mx-2" 
            type="text" 
            name="price_per_token1" 
            value={pricePer1.toString()}
            disabled
          />
          <div className="input-group-text">{token0.symbol}</div>
        </div>
      </div>
    </div>
    </>
  )
}
