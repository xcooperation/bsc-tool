import { useEffect, useState } from "react"
import XLSX from "xlsx"
import {saveAs} from 'file-saver'
// components
import GenerateForm from "../../components/Form/GenerateForm"
import WalletTable from "../../components/Table/WalletTable/WalletTable"
import DropZone from "../../components/File/DropZone/DropZone"

import "./Wallet.css"
import DownloadBtn from "../../components/Button/DownloadBtn"
import CancelBtn from "../../components/Button/CancelBtn"

export default function Wallet() {
  const [quantity, setQuantity] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState([])


  useEffect(() => {
    const storedData = localStorage.getItem("excel-data")
    if (storedData) {
      setData(JSON.parse(storedData))
      setGenerated(true)
    }
  }, [])

  // Handle generating number
  const handleGenerate = async function (e) {
    e.preventDefault()
    const { quantityInp } = e.target.elements

    if (quantityInp.value > 0) {
      setQuantity(parseInt(quantityInp.value))
      setGenerated(true)
    } else {
      setError("Can not generate with amount of 0")
    }
  }

  // Handle canceling the file
  const handleCancel = function() {
    localStorage.removeItem("excel-data")
    setGenerated(false)
  } 

  // Handle download the file
  const handleDownload = function() {
    /* build worksheet from the grid data */
    const ws = XLSX.utils.json_to_sheet(data)
    
    /* build up workbook */
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Wallets')

    /* at this point, out.xlsb will have been downloaded */
    /* bookType can be any supported output type */
    const wopts = { bookType:'xlsx', bookSST:false, type:'array' };

    const wbout = XLSX.write(wb,wopts);

    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([wbout],{type:"application/octet-stream"}), "bsc-wallets.xlsx");
  }

  return (
    <div className="container-fluid my-3">
      <div className="card ">
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
              <div className="d-flex justify-content-end px-2">
                <DownloadBtn handler={handleDownload}/>
                <CancelBtn handler={handleCancel} />
              </div>
              <WalletTable jsonData={data} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
