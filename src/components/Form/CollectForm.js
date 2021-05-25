
export default function CollectForm({
  token,
  handleSubmit,
  error, 
  mainWallet,
  setMainWallet,
}) {
  return (
    <>
      <div className="card-header">
        Collect [{token.symbol}]
      </div>
      <div className="card-body">
        {/* Generate */}
        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-center p-1">
            <div className="col-9">
              <div className="form-group">
                {/* Wallet Address */}
                <div className="input-group mb-3">
                  <span className="input-group-text" id="spread-pk">Recipient's address</span>
                  <input 
                    type="text" 
                    name="wallet_address_inp"
                    className="form-control"
                    value={(mainWallet && mainWallet.address) ? mainWallet.address : ''}
                    onChange={e => setMainWallet({address: e.target.value})}
                  />
                </div>

                <div className="text-right">
                  <button 
                    className="btn btn-primary" 
                    type="submit">
                    Collect
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
