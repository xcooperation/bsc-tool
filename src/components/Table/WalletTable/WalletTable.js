import { useState } from "react"
import { MDBDataTable } from "mdbreact"

import { getColumns } from "./Column"

export default function WalletTable({ rowData }) {
  const [columns] = useState(getColumns(Object.keys(rowData[0])))
  const data = { columns, rows: rowData }

  return (
    <>
      {/* Table */}
      <div
        className="datatable-container"
        style={{ overflowX: "scroll", maxWidth: "100%", fontSize: "0.85rem" }}
      >
        <MDBDataTable striped bordered hover data={data} />
      </div>
    </>
  )
}
