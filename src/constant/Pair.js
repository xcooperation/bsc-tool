import PAIR_ABI from '../ABI/PAIR.json'

export const pairs = [
  // 'SLC_DPC'
  {
    address: '0xff5B89Bd6972aE070286442Fa6D5BB2489F9E2db',
    decimal: 18,
    symbol: 'SLC_DPC',
    name: 'SLC - DPC',
    token0: '0x8efbb606d0467f70db21208736eb3a1126321658',
    token1: '0xbc9695302321594e7daedc5a974f4562f71c588c',
    ABI: PAIR_ABI
  },
  // 'WBNB_DPC'
  {
    address: '0xb3C1B14e73AbbDC6b8822D4712232D53847896db',
    decimal: 18,
    symbol: 'WBNB_DPC',
    name: 'WBNB - DPC',
    token0: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
    token1: '0xbc9695302321594e7daedc5a974f4562f71c588c',
    ABI: PAIR_ABI
  },
  // 'WBNB_SLC'
  {
    address: '0x8fC41326a5b7B7AffDDA26C6B215529a9be2e40d',
    decimal: 18,
    symbol: 'WBNB_SLC',
    name: 'WBNB - SLC',
    token0: '0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F',
    token1: '0x8efbb606d0467f70db21208736eb3a1126321658',
    ABI: PAIR_ABI
  },
]