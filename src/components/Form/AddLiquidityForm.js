import { useEffect, useState } from "react"
import SubmitBtn from "../Button/SubmitBtn"

export default function AddLiquidityForm({
  pairs,
  pool,
  token0,
  token1,
  amount0,
  setAmount0,
  amount1,
  setAmount1,
  error,
  handleSubmit,
  handleSelect,
  handlePK,
}) {
  const [privateKey, setPrivateKey] = useState("")

  useEffect(() => {
    if (privateKey) {
      handlePK(privateKey)
    }
  }, [privateKey])

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center p-1">
          <div className="col-12 mt-3">
            {/* Token 0 */}
            <div className="form-group col">
              <div className="input-group-prepend">
                <div className="input-group-text mr-2">Pair</div>
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

            {/* Private key */}
            <div className="form-group col">
              <div className="input-group-prepend">
                <div className="input-group-text mr-2">Private key</div>
                <input
                  className="form-control text-center"
                  type="text"
                  name="wallet_pk_inp"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
              </div>
            </div>

            {pool && privateKey && (
              <>
                {/* Amount0 */}
                <div className="form-group col">
                  <div className="input-group-prepend">
                    <div className="input-group-text mr-2">{token0.symbol}</div>
                    <input
                      className="form-control text-center"
                      step="any"
                      min={0}
                      type="number"
                      name="amount0_inp"
                      value={amount0}
                      onChange={(e) => e.target.value && setAmount0(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                {/* Amount1 */}
                <div className="form-group col">
                  <div className="input-group-prepend">
                    <div className="input-group-text mr-2">{token1.symbol}</div>
                    <input
                      className="form-control text-center"
                      step="any"
                      min={0}
                      type="number"
                      name="amount1_inp"
                      value={amount1}
                      onChange={(e) => e.target.value && setAmount1(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Amount0 and Amount1 */}
            {privateKey && (
              <>
                <div className="mb-3 mt-4">
                  <div className="d-flex flex-column">
                    <SubmitBtn text="Add liquidity" style={{ textTransform: "capitalize" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {error && <p className="text-danger text-center text-small"> {error} </p>}
      </form>
    </>
  )
}
