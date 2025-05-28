import axios from "axios"

const priceApi = "https://min-api.cryptocompare.com/data/price?tsyms=USD&fsym="

// Fallback prices for development
const fallbackPrices: Record<string, number> = {
  bnb: 310.5,
  eth: 2340.75,
  matic: 0.85,
  avax: 35.2,
  ftm: 0.42,
  op: 2.15,
}

export const getPriceForCoin = async (coin: string): Promise<number> => {
  try {
    const response = await axios.get(`${priceApi}${coin.toUpperCase()}`, {
      timeout: 5000,
    })
    return response.data.USD || fallbackPrices[coin.toLowerCase()] || 0
  } catch (error) {
    console.warn(`Using fallback price for ${coin} due to API error`)
    return fallbackPrices[coin.toLowerCase()] || 0
  }
}

export const getMultiplePrices = async (coins: string[]): Promise<Record<string, number>> => {
  try {
    const promises = coins.map((coin) => getPriceForCoin(coin))
    const prices = await Promise.all(promises)

    return coins.reduce(
      (acc, coin, index) => {
        acc[coin.toLowerCase()] = prices[index]
        return acc
      },
      {} as Record<string, number>,
    )
  } catch (error) {
    console.warn("Using fallback prices due to API error")
    return fallbackPrices
  }
}
