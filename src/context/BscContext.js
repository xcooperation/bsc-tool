import Web3 from 'web3'
import {useContext, createContext} from 'react'

const BscContext = createContext()

export const BscProvider = function({children}) {
  const bsc_rpc_main = 'https://bsc-dataseed.binance.org/'
  const bsc_rpc_test = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  const web3 = new Web3(bsc_rpc_test)
  
  return (
    <BscContext.Provider value={{
      web3
    }}>
      {children}
    </BscContext.Provider>
  )
}

export const useBscContext = function() {
  return useContext(BscContext)
}