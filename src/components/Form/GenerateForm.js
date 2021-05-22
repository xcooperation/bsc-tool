export default function GenerateForm({
  handleGenerate, 
  quantity, 
  setQuantity,
  error
}) {
  return (
    <>
      <div className="card-header">
          Generate wallets
      </div>
      <div className="card-body">
        {/* Generate */}
        <form onSubmit={handleGenerate} className="inline" >
          <div className="d-flex justify-content-center p-1">
            <div className="col-4">
              <div className="form-group">
                <div className="input-group mb-3">
                  <span className="input-group-text" id="basic-addon1">Quantity</span>
                  <input 
                    type="number" 
                    name="quantityInp"
                    className="form-control text-center"
                    value={quantity}
                    min={0}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                  <button className="btn btn-primary" type="submit">
                    Generate
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
