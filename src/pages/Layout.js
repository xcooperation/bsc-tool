import { Route } from "react-router-dom"

// Pages
import Home from "./Home"
import Wallet from "./Wallet/Wallet"
import Pool from "./Pool/Pool"
import Swap from "./Swap/Swap"
import Pair from "./Pair/Pair"
import Liquidity from "./Liquidity/Liquidity"

export default function Layout() {
  return (
    <>
      <Route exact path="/home">
        <Home />
      </Route>

      <Route exact path="/wallet">
        <Wallet />
      </Route>

      {/* Pool */}
      <Route exact path="/pool/reserve">
        <Pool />
      </Route>

      <Route exact path="/pool/pair">
        <Pair />
      </Route>

      <Route exact path="/pool/liquidity">
        <Liquidity />
      </Route>

      <Route exact path="/swap">
        <Swap />
      </Route>
    </>
  )
}
