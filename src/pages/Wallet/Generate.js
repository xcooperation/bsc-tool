import { useState, useEffect } from "react"
import XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useBscContext } from "../../context/BscContext"
// components
import GenerateForm from "../../components/Form/GenerateForm"
import WalletTable from "../../components/Table/WalletTable/WalletTable"
import DropZone from "../../components/File/DropZone/DropZone"
import DownloadBtn from "../../components/Button/DownloadBtn"
import CancelBtn from "../../components/Button/CancelBtn"
import SpreadBtn from "../../components/Button/SpreadBtn"
import CollectBtn from "../../components/Button/CollectBtn"
import BalanceBtn from "../../components/Button/BalanceBtn"

export default function Generate({ data, setData, token, setToken, setStage}) {
  const { generateWallet, storeData, getData, removeData } = useBscContext()
  const [generated, setGenerated] = useState(false)
  const [quantity, setQuantity] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedData = getData()
    if (storedData) {
      setData(storedData)
      setGenerated(true)
    }
  }, [])

  // Handle generating number
  const handleGenerate = async function (e) {
    e.preventDefault()
    const { quantityInp } = e.target.elements
    const quantity = parseInt(quantityInp.value)

    if (quantity > 0) {
      const wallets = await generateWallet(quantity)
      // Save data
      storeData(wallets)
      setData(wallets)
      // Forwarding
      setQuantity(quantity)
      setGenerated(true)
    } else {
      setError("Can not generate with amount of 0")
    }
  }

  // Handle canceling the file
  const handleCancel = function () {
    removeData()
    setGenerated(false)
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
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "bsc-wallets.xlsx")
  }

  // Handle spread token
  const handleSpreadToken = function() {
    setStage('spread')
  }

  // Handle collecct token
  const handleCollectToken = function() {
    setStage('collect')
  }

  // Handle Balance button
  const handleBalanceBtn = function() {
    setStage('balance')
  }

  return (
    <>
      {/* Form */}
      {!generated && (
        <>
          <GenerateForm
            handleGenerate={handleGenerate}
            quantity={quantity}
            setQuantity={setQuantity}
            error={error}
          />
          <div className="px-4">
            <hr data-content="OR" className="hr-text" />
          </div>

          {/* Drop file */}
          <DropZone setData={setData} setGenerated={setGenerated} />
        </>
      )}

      {/* Table */}
      {generated && (
        <>
          <div className="card-header">List of wallets</div>
          <div className="card-body p-3">
            {/* Buttons */}
            <div className="d-flex px-2 justify-content-between mb-2">
              {/* Left */}
              <div className="left-buttons" style={{position: 'relative'}}>
                <BalanceBtn
                  setToken={setToken} 
                  token={token} 
                  handler={handleBalanceBtn}
                  />

                <CollectBtn handler={handleCollectToken} setToken={setToken} token={token} />
                <SpreadBtn 
                  handler={handleSpreadToken} setToken={setToken} token={token} />
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
