export function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  
  return function() {
    h = Math.imul(48271, h) | 0;
    return (h >>> 0) / 2147483647;
  };
}

export function generateSparklineData(seed: string, points: number, trend: 'up' | 'down' | 'flat'): Array<{value: number}> {
  const rng = seededRandom(seed);
  const data: Array<{value: number}> = [];
  let current = 50 + rng() * 50;
  
  const step = trend === 'up' ? 2 : trend === 'down' ? -2 : 0;
  
  for (let i = 0; i < points; i++) {
    current += step + (rng() - 0.5) * 10;
    data.push({ value: Math.max(0, current) });
  }
  
  return data;
}

export function generateCandlestickData(seed: string, interval: string, candles: number): Array<{time: string, open: number, high: number, low: number, close: number}> {
  const rng = seededRandom(seed + interval);
  const data: Array<{time: string, open: number, high: number, low: number, close: number}> = [];
  
  let currentPrice = 0.000007; // Base price for WPLS/DAI
  const volatility = 0.0000001;
  
  for (let i = 0; i < candles; i++) {
    const open = currentPrice;
    const close = open + (rng() - 0.5) * volatility;
    const high = Math.max(open, close) + rng() * volatility * 0.5;
    const low = Math.min(open, close) - rng() * volatility * 0.5;
    
    data.push({
      time: i.toString(),
      open,
      high,
      low,
      close
    });
    
    currentPrice = close;
  }
  
  return data;
}
