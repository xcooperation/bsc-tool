import { useState } from "react"
import { MDBDataTable } from "mdbreact"

import { getColumns } from "./Column"

export default function WalletTable({ jsonData }) {
  const [columns] = useState(getColumns(Object.keys(jsonData[0])))
  const data = { columns, rows: jsonData }

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
