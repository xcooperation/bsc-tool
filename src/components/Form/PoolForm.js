import React from "react"

export default function PoolForm({ pairs, handleSelect, pool }) {
  return (
    <div className="p-3">
      <form>
        <div className="form-group">
          <div className="input-group-prepend">
            <div className="input-group-text mr-2">Reserve</div>
            <select
              className="form-control"
              id="exampleFormControlSelect1"
              onChange={handleSelect}
              value={pool ? pool.address : ""}
            >
              <option value="">Choose a pair</option>
              {pairs.map((pair, index) => {
                return (
                  <option key={index} value={pair.address}>
                    {pair.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </form>
    </div>
  )
}
