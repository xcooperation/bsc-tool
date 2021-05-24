import { useMemo } from "react"
import { useDropzone } from "react-dropzone"
import {useBscContext} from '../../../context/BscContext'
import {baseStyle, activeStyle, acceptStyle, rejectStyle} from './Style'
import {readExcelFile, checkFileExtension} from './Event'


export default function DropZone({setData, setGenerated}) {
  const {storeData} = useBscContext()
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    accept:
      "text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    maxFiles: 1,
    validator: checkFileExtension,
    onDropAccepted: async (acceptedFiles) => {
      const wsJsonData = await readExcelFile(acceptedFiles)
      storeData(wsJsonData)
      setData(wsJsonData)
      setGenerated(true)
    }
  })

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  )

  return (
    <section className="container my-3">
      <div {...getRootProps({ style, className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.xls and *.xlsx file will be accepted)</em>
      </div>

      {/* Error */}
      <aside className="p-1 mt-2">
        {/* Show error when rejecting file */}
        {fileRejections.map(({ file, errors }) => {
          return errors.map((e) => (
            <p key={e.code} className="text-danger">
              {e.message}
            </p>
          ))
        })}
      </aside>

    </section>
  )
}
