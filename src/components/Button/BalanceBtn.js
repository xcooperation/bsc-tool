import {MdAccountBalanceWallet} from 'react-icons/md'

export default function BalanceBtn({token, setToken, handler}) {
  // handle dropdown
  const handleDropdown = function() {
    const dropdownDiv = document.querySelector("#balance-dropdown")
    dropdownDiv.classList.toggle("d-block")
  }

  // handle select token
  const handleSelectToken = function(e) {
    setToken(e.target.textContent)
    handleDropdown()
  }

  return (
    <div className="btn-group mr-2">
    <button 
      className="btn"
      style={{backgroundColor: "#328fa8"}}
      title="Balance" 
      onClick={handler}>
      <MdAccountBalanceWallet /> Balance
    </button>
    
    <button type="button"
      style={{backgroundColor: "#35a0bd"}}
      className="btn dropdown-toggle dropdown-toggle-split" 
      data-toggle="dropdown" 
      aria-haspopup="true" 
      aria-expanded="false"
      onClick={handleDropdown}>
      <span className="mr-2">
        {token ? `[${token}]` : ''}
      </span>
      <span className="ml-2 sr-only">Toggle Dropdown</span>
    </button>
    <div id="balance-dropdown" className="dropdown-menu">
      <span 
        className="dropdown-item" 
        onClick={handleSelectToken}
        to="#">BNB</span>
      <div className="dropdown-divider"></div>
      <span 
        className="dropdown-item" 
        onClick={handleSelectToken}
        to="#">USDT</span>
    </div>
  </div>
  )
}
