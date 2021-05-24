import {ImCross} from 'react-icons/im'

export default function CancelBtn({handler}) {
  return (
    <button 
      className="btn btn-danger" 
      title="Cancel" 
      onClick={handler}>
      <ImCross />
    </button>
  )
}
