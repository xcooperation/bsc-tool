import BEP20_ABI from '../ABI/BEP20.json'
import IPH_ABI from '../ABI/IPH.json'

export const BNB = {
  symbol: "BNB",
  decimal: 18,
  // address: 'BNB',
  address: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
  ABI: BEP20_ABI
}

// export const WBNB = {
//   symbol: "WBNB",
//   decimal: 18,
//   address: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
//   ABI: BEP20_ABI
// }

export const WBNB = {
  symbol: "WBNB",
  decimal: 18,
  address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  ABI: BEP20_ABI
}

export const DPC = {
  symbol: "DPC",
  address: "0xbc9695302321594e7daedc5a974f4562f71c588c",
  decimal: 18,
  ABI: BEP20_ABI
}

export const SLC = {
  symbol: "SLC",
  address: "0x8efbb606d0467f70db21208736eb3a1126321658",
  decimal: 18,
  ABI: BEP20_ABI
}

export const TEST2 = {
  symbol: "TEST2",
  address: "0x27bcd022f7af6fa3b254904cdf88bd44a1f15753",
  decimal: 6,
  ABI: BEP20_ABI
}

export const IPH = {
  symbol: "IPH",
  // address: "0xa5FE89bE6fD630cd46F3B840902f851e5D153AD4",
  address: "0x493e4923760cedc958df6fe6931cda3fdb794611",
  decimal: 6,
  ABI: IPH_ABI
}

export const IPH2 = {
  symbol: "IPH2",
  address: "0xd76d4dfb56497723cc3a8f34b4a3437a5a43ee46",
  decimal: 6,
  ABI: IPH_ABI
}