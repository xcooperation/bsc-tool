import React from "react"

export default function PoolForm({pairs, handleSelect, pool}) {
  return (
    <div className="p-3">
      <form>
        <div className="form-group">
          <label htmlFor="exampleFormControlSelect1">Pair</label>
          <select 
            className="form-control" 
            id="exampleFormControlSelect1"
            onChange={handleSelect}
            value={(pool) ? pool.address : ''}>
              <option value="">Choose a pair</option>
              {pairs.map((pair, index) => {
                return (
                  <option key={index} value={pair.address}>{pair.name}</option>
                )
              })}
          </select>
        </div>
      </form>
    </div>
  )
}
