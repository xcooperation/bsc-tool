import { useEffect, useState } from "react"
import SubmitBtn from "../Button/SubmitBtn"

export default function SwapForm({
  token,
  error,
  handleSubmit,
  handleToken,
  handlePK,
}) {
  const [privateKey, setPrivateKey] = useState("")

  useEffect(() => {
    if (token) {
      document.getElementById("token1_symbol").textContent = token.symbol
    }
  }, [token])

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
                <div className="input-group-text mr-2">Token 0</div>
                <input
                  className="form-control text-center"
                  type="text"
                  name="token0_inp"
                  value="BNB"
                  disabled
                />
              </div>
            </div>

            {/* Token 1 */}
            <div className="form-group col">
              <div className="input-group-prepend">
                <div className="input-group-text mr-2">Token 1</div>
                <input
                  className="form-control text-center"
                  type="text"
                  name="token1_inp"
                  value={token ? token.address : ""}
                  onChange={handleToken}
                  placeholder="Input the address of the token"
                />
                <div id="token1_symbol" className="input-group-text ml-2">
                  {/*  */}
                </div>
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
                  onChange={e => setPrivateKey(e.target.value)}
                  />
              </div>
            </div>

            {/* Amount0 and Amount1 */}
            {privateKey && token && !error && (
              <>
                <div className="mb-3 mt-4">
                  <div className="d-flex flex-column">
                    <SubmitBtn text="Create pair" style={{ textTransform: "capitalize" }} />
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
