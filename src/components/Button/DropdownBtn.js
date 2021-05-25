
export default function DropdownBtn({ items, token, setToken, name, style }) {
  // handle dropdown
  const handleDropdown = function() {
    const dropdownDiv = document.querySelector(`#${name}-dropdown`)
    dropdownDiv.classList.toggle("d-block")
  }

  // handle select token
  const handleSelectToken = function(e) {
    setToken(e.target.textContent)
    handleDropdown()
  }
  return (
    <>
      <button
        type="button"
        style={style}
        className="btn dropdown-toggle dropdown-toggle-split"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        onClick={handleDropdown}
      >
        <span className="mr-2">{token ? `[${token}]` : ""}</span>
        <span className="ml-2 sr-only">Toggle Dropdown</span>
      </button>
      <div id={`${name}-dropdown`} className="dropdown-menu">
        {items.map(item => {
          if (item.symbol === 'BNB') {
            return (<>
            <span className="dropdown-item" onClick={handleSelectToken}>
              {item.symbol}
            </span>
            <div className="dropdown-divider"></div>
            </>)
          }

          return (
            <span className="dropdown-item" onClick={handleSelectToken}>
              {item.symbol}
            </span>
          )
        })}
      </div>
    </>
  )
}
