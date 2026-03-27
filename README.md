# Gas Calculator

Is it worth driving further for cheaper gas? This calculator does the actual math.

## Setup

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects Vite — just hit Deploy
4. Done ✓

## Customize the About Page

Open `src/pages/About.jsx` and update:
- Your bio text
- Your YouTube channel URL
- Your portfolio URL

## The Math

- **P₁** = (Tₕ − T꜀ − R·D₁/MPG) × G₁  → cost at closer station
- **P₂** = (Tₕ − T꜀ − R·D₂/MPG) × G₂  → cost at further station
- **Savings** = P₁ − P₂  → positive means further station wins

Where:
- G₁/G₂ = gas price per gallon
- D₁/D₂ = distance to each station
- Tₕ = tank capacity, T꜀ = current fuel level
- MPG = miles per gallon
- R = 1 (on the way) or 2 (dedicated round trip)
