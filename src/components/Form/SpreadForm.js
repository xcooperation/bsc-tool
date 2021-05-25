import { useState } from 'react'

export default function SpreadForm({
  token,
  handleSubmit,
  error, setAmount, amount
}) {
  const [privateKey, setPrivateKey] = useState('')

  return (
    <>
      <div className="card-header">
        Spread [{token.symbol}]
      </div>
      <div className="card-body">
        {/* Generate */}
        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center p-1">
            <div className="col-9">
              <div className="form-group">
                {/* Wallet PK */}
                <div className="input-group mb-3">
                  <span className="input-group-text" id="spread-pk">Private Key</span>
                  <input 
                    type="text" 
                    name="wallet_pk_inp"
                    className="form-control"
                    value={privateKey}
                    onChange={e => setPrivateKey(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="input-group mb-3">
                  <span className="input-group-text" id="spread-amount">Amount</span>
                  <input 
                    type="number" 
                    name="amount_inp"
                    className="form-control"
                    min={0}
                    step={'any'}
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value))}
                  />
                </div>
                <div className="text-right">
                  <button 
                    className="btn btn-primary" 
                    type="submit">
                    Spread
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
