import React from 'react'

export default function SubmitBtn({text, style, handler}) {
  return (
    <button
      className="btn btn-primary"
      style={style}
      onClick={handler}>
      {text}
    </button>
  )
}
