import React from 'react'
import {FaDownload} from 'react-icons/fa'

export default function DownloadBtn({handler}) {
  return (
    <button 
      className="btn btn-primary mx-2" 
      title="Download" 
      onClick={handler}>
      <FaDownload />
    </button>
  )
}
