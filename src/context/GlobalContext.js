import {createContext, useContext, useEffect, useState} from 'react'

const GlobalContext = createContext()

export const GlobalProvider = function({children}) {
  const navLinks = ['home', 'wallet', 'pool', 'swap']
  const subLinks = {pool: ["reserve", "pair", "liquidity"]}
  const [activeNav, setActiveNav] = useState('home')

  useEffect(() => {
    const currentPath = window.location.pathname.split("/")[1]
    navLinks.forEach((link) => {
      if (link === currentPath) {
        setActiveNav(link)
      }
    })
  })

  return (
    <GlobalContext.Provider value={{
      navLinks, subLinks,
      activeNav, setActiveNav
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = function() {
  return useContext(GlobalContext)
}

