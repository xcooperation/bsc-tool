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
  const [selected, setSelected] = useState(false)

  // handle Select
  const handleSelect = function (e) {
    const selectedToken = TOKENS.find((t) => t.address === e.target.value)
    
    setToken(selectedToken)
    setSelected(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-center p-1">
          <div className="col-9 mt-3">
            {/* Select */}
            <div className="form-group">
              <div className="input-group-prepend">
                <div className="input-group-text mr-2">Swap from</div>
                <select
                  className="form-control"
                  name="from_token_inp"
                  onChange={handleSelect}
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
            {/* Amount */}
            {selected && (
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
