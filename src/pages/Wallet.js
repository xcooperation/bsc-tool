import {Link} from 'react-router-dom'
import {useState, useEffect} from 'react'
// components
import GenerateForm from '../components/Form/GenerateForm'
import WalletTable from '../components/Table/WalletTable/WalletTable'

export default function Wallet() {
  const [quantity, setQuantity] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState("")

  // Handle generating number
  const handleGenerate = async function(e) {
    e.preventDefault()
    const {quantityInp} = e.target.elements
    
    if (quantityInp.value > 0) {
      setQuantity(parseInt(quantityInp.value))
      setGenerated(true)
    } else {
      setError("Can not generate with amount of 0")
    }
  }

  return (
    <div className="container-fluid my-3">
      <div className="card">
        {/* Form */}
        {!generated && 
          <GenerateForm 
            handleGenerate={handleGenerate} 
            quantity={quantity} 
            setQuantity={setQuantity}
            error = {error}
          />
        }

        {/* Table */}
        {generated && <WalletTable /> }
      </div>
    </div>
  )
}
