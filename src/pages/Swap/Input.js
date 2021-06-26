import { useState, useEffect } from "react"
import XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useBscContext } from "../../context/BscContext"
// components
import PrivateKeyForm from "../../components/Form/PrivateKeyForm"
import WalletTable from "../../components/Table/WalletTable/WalletTable"
import DropZone from "../../components/File/DropZone/DropZone"
import DownloadBtn from "../../components/Button/DownloadBtn"
import CancelBtn from "../../components/Button/CancelBtn"
import SwapBtn from "../../components/Button/SwapBtn"

export default function Input({ data, setData, pair, setPair, setStage}) {
  const { storeData, getData, removeData, getWalletByPK } = useBscContext()
  const [dropped, setDropped] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedData = getData()
    if (storedData) {
      setData(storedData)
      setDropped(true)
    }
  }, [])

  // Handle generating number
  const handlePrivateKeyForm = async function (e) {
    e.preventDefault()
    const { wallet_pk_inp } = e.target.elements
    const wallet_pk = wallet_pk_inp.value
    
    if (wallet_pk.toString()) {
      try {
        const {wallet} = await getWalletByPK(wallet_pk)
        if (wallet) {
          storeData([wallet])
          setData([wallet])
          setDropped(true)
          return
        }
      } catch (error) {
        setError(error.message)
      }
    }

    setError("Private key is not valid.")
  }

  // Handle canceling the file
  const handleCancel = function () {
    removeData()
    setDropped(false)
  }

  // Handle download the file
  const handleDownload = function () {
    /* build worksheet from the grid data */
    const ws = XLSX.utils.json_to_sheet(data)

    /* build up workbook */
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Wallets")

    /* at this point, out.xlsb will have been downloaded */
    /* bookType can be any supported output type */
    const wopts = { bookType: "xlsx", bookSST: false, type: "array" }

    const wbout = XLSX.write(wb, wopts)

    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "bsc-swap-wallets.xlsx")
  }

  // Handle Balance button
  const handleSwapBtn = function() {
    if (pair) {
      setStage('logger')
    }
  }

  return (
    <>
      {/* Form */}
      {!dropped && (
          <>
            <PrivateKeyForm 
              handlePKForm={handlePrivateKeyForm}
              error={error}
            />
            <div className="px-4">
              <hr data-content="OR" className="hr-text" />
            </div>

            {/* Drop file */}
            <DropZone setData={setData} setGenerated={setDropped} />
          </>
      )}

      {/* Table */}
      {dropped && (
        <>
          <div className="card-header">List of wallets</div>
          <div className="card-body p-3">
            {/* Buttons */}
            <div className="d-flex px-2 justify-content-between mb-2">
              {/* Left */}
              <div className="left-buttons" style={{position: 'relative'}}>
                <SwapBtn
                  pair={pair}
                  setPair={setPair} 
                  handler={handleSwapBtn}
                  />
              </div>
              {/* Right */}
              <div className="right-buttons">
                <DownloadBtn handler={handleDownload} />
                <CancelBtn handler={handleCancel} />
              </div>
            </div>

            {/* Table */}
            <WalletTable rowData={data} />
          </div>
        </>
      )}
    </>
  )
}
