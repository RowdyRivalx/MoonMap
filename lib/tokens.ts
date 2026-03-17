// Shared Solana mint address mappings for DAO tokens

export const SOL_MINT = 'So11111111111111111111111111111111111111112'

export const COIN_TO_MINT: Record<string, string> = {
  solana: SOL_MINT,
  uniswap: '8FU95xFJhUUkyyCLU13HSzDLs7oC4QZdXQHL6SCeab36',
  aave: '3vAs4D1WE6Na4tCgt4BApgFfENDCect3y9PX2fMqDLp',
  'lido-dao': 'HZRCwxP2Vq9PCpPXooayhJ2bxTpo5xfpQrwB1svh332d',
  decentraland: 'EzfgjvkSwthhgHaceR3LnKXUoRkP6NUhfghdaHAj1tUv',
  'the-sandbox': 'FnKE9n6aGjQoNWRBZXy4RW6LZVao7qwBonUbiD7edUmZ',
  'axie-infinity': 'HNpdP2rL6FR3gHdoTSBLBEUPrCCTDdVEsMjRMpAGnJzF',
  apecoin: '4vMsoUT2BWatFweudnQM1xedRLfJgJ7hswhcpz4xgBTy',
  sushi: 'SUSHiMMjX1argfn7WB2bXcKGiMMPTmM9RFVcPHc9FFNA',
  'curve-dao-token': 'CRVPF2nQRrezq2Tyq18s6DAho7HjDrsrUxqX4shfrpUY',
  'compound-governance-token': 'BAoWfhRJq4FVWDZBwPynyx2HntC3XitE3RymAzXcGJVn',
  'yearn-finance': 'CGFoqbySnUgTU5iPaAveTtgVZND7ChqeBnKBu3AYQhYe',
  balancer: 'FDSLXJgs2tdzw8mFPUcSudAKkqVQLWdbpjQAJmmoJzGZ',
  maker: 'EVu6ZdtPiSpteHRKuznVmAMBkcmP9ZqZexJkqUk7frUF',
  ens: 'F9jmLbcfeiEMyMP3DBMczykAL9kMZh7HDkDaiMWp6Fgx',
  gitcoin: 'EzgEw9qevbREonkg9LdPDyBNNm2KDuQfwb9kwyAVFLVL',
  olympus: 'EyEfWq7vVfiy1WJPzNv2dNBoX1VoJQwHpFp6bNwBhdSs',
  illuvium: 'C4kNoGdDexYsGKn97y1KEPWbw27i8RNSeM5NaJ35mkxa',
  'ribbon-finance': '3P9xwxrU4AuRSYU6cR5hrXJMhzw4okdzyGxgSEv9pump',
  'convex-finance': 'Gsui8MEE5C8nzsF8SLasivphmZv9n2V2WpM8Yj5Ww7a6',
  // Solana-native tokens
  jupiter: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  bonk: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  dogwifcoin: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  'jito-governance': 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwt2KnK4nKRh',
  'pyth-network': 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  orca: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  raydium: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  marinade: 'MNDEFzGvMt87ueuHvVU9VcTqsAP5b3fTGPsHuuPA5ey',
  'drift-protocol': 'DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7',
  'render-token': 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
  helium: 'hntyVP6YFm1Hg25TN9WGLqM18LQ4fHoeUTCqgkdpQWz',
  stepn: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
  gmt: '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
  atlas: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
  polis: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
  samo: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
}

export const MINT_TO_COIN: Record<string, string> = Object.fromEntries(
  Object.entries(COIN_TO_MINT).map(([k, v]) => [v, k])
)
