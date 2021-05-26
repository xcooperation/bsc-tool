import { useState } from "react"

export default function PrivateKeyForm({
  handlePKForm, 
  error
}) {
  const [privateKey, setPrivateKey] = useState("")
  return (
    <>
      <div className="card-header">
          Import
      </div>
      <div className="card-body">
        {/* Set PK */}
        <form onSubmit={handlePKForm} className="inline" >
          <div className="d-flex justify-content-center p-1">
            <div className="col-4">
              <div className="form-group">
                <div className="input-group mb-3">
                  {/* Private key */}
                  <span className="input-group-text" id="basic-addon1">Private key</span>
                  <input
                    className="form-control text-center"
                    type="text"
                    name="wallet_pk_inp"
                    value={privateKey}
                    onChange={e => setPrivateKey(e.target.value)}
                    />
                  <button className="btn btn-primary" type="submit">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        
        {error && (
          <p className="text-danger text-center text-small"> {error} </p>
        )}  
      </div>
    </>
  )
}
