import XLSX from "xlsx"
export const checkFileExtension = function (file) {
  if (
    file.type !== "application/vnd.ms-excel" &&
    file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return {
      code: "file-is-not-accepted",
      message: `'${file.name}' is not accepted. Only *.xls and *.xlsx file will be accepted`,
    }
  }

  return null
}

export const readExcelFile = async ([file]) => {
  const promise = new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.readAsArrayBuffer(file)

    reader.onload = function (e) {
        var contents = new Uint8Array(e.target.result)
        var workbook = XLSX.read(contents, { type: "array" })
    
        /* DO SOMETHING WITH workbook HERE */
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const worksheetJSON = XLSX.utils.sheet_to_json(worksheet)
        
        localStorage.setItem("excel-data", JSON.stringify(worksheetJSON))
        resolve(worksheetJSON)
    }

    reader.onerror = function(error) {
      reject(error)
    }
  })

  return promise.then(result => result).catch(e => console.log(e))
}
