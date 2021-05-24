import {FaBuffer} from 'react-icons/fa'

export default function CollectBNBBtn({handler, token, setToken}) {
  // handle dropdown
  const handleDropdown = function() {
    const dropdownDiv = document.querySelector("#collect-dropdown")
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
        style={{backgroundColor: "#27aae3"}}
        type="button" 
        className="btn"
        onClick={handler}>
        <FaBuffer className="mr-1" /> Collect
      </button>
      
      <button type="button"
        style={{backgroundColor: "#03b1fc"}}
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
      <div id="collect-dropdown" className="dropdown-menu">
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
