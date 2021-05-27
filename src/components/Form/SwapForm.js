import { useState } from "react"
import SubmitBtn from "../Button/SubmitBtn"

export default function SwapForm({
  setToken,
  token,
  TOKENS,
  amount,
  setAmount,
  error,
  handleSubmit,
}) {
  const [toToken, setToToken] = useState("")
  const [selectedFrom, setSelectedFrom] = useState(false)
  
  // handle Select from
  const handleSelectFrom = function (e) {
    if (e.target.value) {
      const selectedToken = TOKENS.find((t) => t.address === e.target.value)
      const unselectedToken = TOKENS.find((t) => t.address !== e.target.value)
  
  
      setToken(selectedToken)
      setSelectedFrom(true)
      setToToken(unselectedToken)
      return
    }


    setToken(null)
    setSelectedFrom(false)
    setToToken("")
  }


  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center p-1">
          <div className="col-9 mt-3">
            <div className="row">
              {/* From */}
              <div className="form-group col">
                <div className="input-group-prepend">
                  <div className="input-group-text mr-2">From</div>
                  <select
                    className="form-control"
                    name="from_token_inp"
                    onChange={handleSelectFrom}
                    value={token ? token.address : ""}
                  >
                    <option value="">Choose a token</option>
                    {TOKENS.map((t, index) => {
                      return (
                        <option key={index} value={t.address}>
                          {t.symbol}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* To */}
              {selectedFrom && (
                <div className="form-group col">
                  <div className="input-group-prepend">
                    <div className="input-group-text mr-2">To</div>
                    <input
                        className="form-control text-center"
                        type="text"
                        name="token1_inp"
                        value={toToken.symbol}
                        disabled
                      />
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            {selectedFrom && (
              <>
                <div className="form-group">
                  <div className="mt-3">
                    <div className="input-group-prepend">
                      <div className="input-group-text mr-2">Amount</div>
                      <input
                        className="form-control text-center"
                        type="number"
                        name="amount_inp"
                        step="any"
                        min={0}
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="d-flex flex-column">
                      <SubmitBtn text="Swap" style={{ textTransform: "capitalize" }} />
                    </div>
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
