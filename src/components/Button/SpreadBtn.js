import {SiFitbit} from 'react-icons/si'

export default function SpreadBNBBtn({handler, token, setToken}) {
  // handle dropdown
  const handleDropdown = function() {
    const dropdownDiv = document.querySelector("#spread-dropdown")
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
        style={{backgroundColor: "#c9d91c"}}
        type="button" 
        className="btn"
        onClick={handler}>
        <SiFitbit className="mr-1" /> Spread
      </button>
      
      <button type="button"
        style={{backgroundColor: "#dae657"}}
        className="btn dropdown-toggle dropdown-toggle-split" 
        data-toggle="dropdown" 
        aria-haspopup="false" 
        aria-expanded="false"
        onClick={handleDropdown}>
        <span className="mr-2">
          {token ? `[${token}]` : ''}
        </span>
        <span className="ml-2 sr-only">Toggle Dropdown</span>
      </button>
      <div id="spread-dropdown" className="dropdown-menu">
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
