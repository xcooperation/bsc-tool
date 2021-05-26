import XLSX from 'xlsx'
import {saveAs} from 'file-saver'
import { useBscContext } from "../../context/BscContext"

import WalletTable from "../../components/Table/WalletTable/WalletTable"
import DownloadBtn from "../../components/Button/DownloadBtn"
import CancelBtn from "../../components/Button/CancelBtn"
import BackBtn from "../../components/Button/BackBtn"
import { useEffect, useState } from 'react'

export default function Result({setStage}) {
  const { swapResultStorageName, storeData, getData, removeData,  } = useBscContext()
  const [resultData, setResultData] = useState(getData(swapResultStorageName))

  // handle backward btn
  const handleBackward = function() {
    setStage('input')
  }

  // handle download
  const handleDownload = function() {
    /* build worksheet from the grid data */
    const ws = XLSX.utils.json_to_sheet(resultData)

    /* build up workbook */
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Result")

    /* at this point, out.xlsb will have been downloaded */
    /* bookType can be any supported output type */
    const wopts = { bookType: "xlsx", bookSST: false, type: "array" }

    const wbout = XLSX.write(wb, wopts)

    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "bsc-swap-result.xlsx")
  }

  // handle cancel
  const handleCancel = function() {
    removeData(swapResultStorageName)
    setStage('generate')
  }

  return (
    <>
      <div className="card-header">Result</div>
      <div className="card-body p-3">
        {/* Buttons */}
        <div className="d-flex px-2 justify-content-between mb-2">
          {/* Left */}
          <div className="left-buttons">
            <BackBtn handler={handleBackward} />
          </div>
          {/* Right */}
          <div className="right-buttons">
            <DownloadBtn handler={handleDownload} />
            <CancelBtn handler={handleCancel} />
          </div>
        </div>

        {/* Table */}
        <WalletTable rowData={resultData} />
      </div>
    </>
  )
}
