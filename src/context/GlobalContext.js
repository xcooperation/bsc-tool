import {createContext, useContext, useState} from 'react'

const GlobalContext = createContext()

export const GlobalProvider = function({children}) {
  const navLinks = ['home', 'wallet', 'swap']
  const [activeNav, setActiveNav] = useState('home')

  return (
    <GlobalContext.Provider value={{
      navLinks,
      activeNav, setActiveNav
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = function() {
  return useContext(GlobalContext)
}

