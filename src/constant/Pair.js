import PAIR_ABI from '../ABI/PAIR.json'

export const pairs = [
  // 'SLC_DPC'
  {
    address: '0xff5B89Bd6972aE070286442Fa6D5BB2489F9E2db',
    decimal: 18,
    symbol: 'SLC-DPC',
    name: 'SLC - DPC',
    token0: '0x8efbb606d0467f70db21208736eb3a1126321658',
    token1: '0xbc9695302321594e7daedc5a974f4562f71c588c',
    ABI: PAIR_ABI
  },
  // 'WBNB_DPC'
  {
    address: '0xb3C1B14e73AbbDC6b8822D4712232D53847896db',
    decimal: 18,
    symbol: 'BNB-DPC',
    name: 'BNB - DPC',
    token0: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
    token1: '0xbc9695302321594e7daedc5a974f4562f71c588c',
    ABI: PAIR_ABI
  },
  // 'WBNB_SLC'
  {
    address: '0x8fC41326a5b7B7AffDDA26C6B215529a9be2e40d',
    decimal: 18,
    symbol: 'BNB-SLC',
    name: 'BNB - SLC',
    token0: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
    token1: '0x8efbb606d0467f70db21208736eb3a1126321658',
    ABI: PAIR_ABI
  },
  // 'DPC_TEST2'
  {
    address: '0x849D44581303c86207AceaCF6387F5Cd95cf9E04',
    decimal: 18,
    symbol: 'DPC-TEST2',
    name: 'DPC - TEST2',
    token0: '0x27bcd022f7af6fa3b254904cdf88bd44a1f15753',
    token1: '0xbc9695302321594e7daedc5a974f4562f71c588c',
    ABI: PAIR_ABI
  },
  {
    address: '0x25b66b2b39f72d2f726427ca026a91c800040810',
    decimal: 18,
    symbol: 'BNB-IPH',
    name: 'BNB - IPH',
    token0: '0xa5fe89be6fd630cd46f3b840902f851e5d153ad4',
    token1: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    ABI: PAIR_ABI
  },
]