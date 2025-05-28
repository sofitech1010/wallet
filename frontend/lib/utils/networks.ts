export const getNetworkName = (chainId: number) => {
  return getNetWorkList().find((network) => network.id === chainId)?.name || "Unknown"
}

export const getCoinList = () => {
  return ["bnb", "avax", "ftm", "eth", "matic", "op"]
}

export const getCoinLogo = (coin: string) => {
  const baseApi = "https://cryptologos.cc/logos"
  const logos: Record<string, string> = {
    bnb: `${baseApi}/bnb-bnb-logo.png`,
    avax: `${baseApi}/avalanche-avax-logo.png`,
    eth: `${baseApi}/ethereum-eth-logo.png`,
    matic: `${baseApi}/polygon-matic-logo.png`,
    ftm: `${baseApi}/fantom-ftm-logo.png`,
    op: `${baseApi}/optimism-ethereum-op-logo.png`,
  }
  return logos[coin.toLowerCase()] || ""
}

export const getDefaultCoin = () => {
  return getCoinList()[0]
}

export const getNetWorkList = (coin?: string) => {
  const networks = [
    {
      id: 97,
      name: "Binance Smart Chain",
      abbr: "bsc",
      coin: "bnb",
      explorerBase: "https://testnet.bscscan.com/tx/",
      color: "#F3BA2F",
    },
    {
      id: 43113,
      name: "Avalanche",
      abbr: "avalanche",
      coin: "avax",
      explorerBase: "https://testnet.snowtrace.io/tx/",
      color: "#E84142",
    },
    {
      id: 17000,
      name: "Ethereum",
      abbr: "ethereum",
      coin: "eth",
      explorerBase: "https://holesky.etherscan.io/tx/",
      color: "#627EEA",
    },
    {
      id: 4002,
      name: "Fantom",
      abbr: "fantom",
      coin: "ftm",
      explorerBase: "https://testnet.ftmscan.com/tx/",
      color: "#1969FF",
    },
    {
      id: 80002,
      name: "Polygon",
      abbr: "polygon",
      coin: "matic",
      explorerBase: "https://amoy.polygonscan.com/tx/",
      color: "#8247E5",
    },
    {
      id: 11155420,
      name: "Optimism",
      abbr: "optimism",
      coin: "op",
      explorerBase: "https://sepolia-optimism.etherscan.io/tx/",
      color: "#FF0420",
    },
  ]

  return coin ? networks.filter((network) => network.coin === coin.toLowerCase()) : networks
}

export const getDefaultNetworkId = (coin: string) => {
  const networkMap: Record<string, number> = {
    bnb: 97,
    avax: 43113,
    eth: 17000,
    ftm: 4002,
    matic: 80002,
    op: 11155420,
  }
  return networkMap[coin.toLowerCase()]
}

export const getNetworkExplorerBase = (chainId: number) => {
  return getNetWorkList().find((network) => network.id === chainId)?.explorerBase || ""
}

export const getCoinFee = (coin: string) => {
  const fees: Record<string, number> = {
    BNB: 0.005,
    AVAX: 0.001,
    ETH: 0.005,
    MATIC: 0.1,
    FTM: 0.5,
    OP: 0.005,
  }
  return fees[coin.toUpperCase()] || 0
}

export const getCoinDecimalsPlace = (coin: string) => {
  const decimals: Record<string, number> = {
    BNB: 8,
    AVAX: 4,
    ETH: 8,
    MATIC: 2,
    FTM: 2,
    OP: 18,
  }
  return decimals[coin.toUpperCase()] || 8
}
