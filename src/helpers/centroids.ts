// Approximate [longitude, latitude] centroids for commonly seen countries.
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [-98, 39], GB: [-1.5, 52.3], CA: [-106, 56], AU: [134, -25], DE: [10, 51],
  FR: [2, 46], IN: [79, 22], JP: [138, 36], CN: [104, 35], BR: [-51, -10],
  RU: [100, 60], IT: [12, 42], ES: [-4, 40], NL: [5.5, 52], SE: [15, 62],
  NO: [9, 61], DK: [10, 56], FI: [26, 64], PL: [19, 52], IE: [-8, 53],
  CH: [8, 47], AT: [14, 47], BE: [4.5, 50.5], PT: [-8, 39.5], MX: [-102, 23],
  AR: [-64, -34], CL: [-71, -30], CO: [-74, 4], ZA: [24, -29], NG: [8, 10],
  EG: [30, 27], KE: [38, 0], AE: [54, 24], SA: [45, 24], IL: [35, 31],
  TR: [35, 39], GR: [22, 39], UA: [32, 49], SG: [104, 1.3], MY: [102, 4],
  ID: [120, -5], TH: [101, 15], VN: [108, 16], PH: [122, 13], KR: [128, 36],
  TW: [121, 24], HK: [114, 22], NZ: [172, -42], PK: [70, 30], BD: [90, 24],
};

export function countryCentroid(code: string): [number, number] | null {
  return COUNTRY_CENTROIDS[code] || null;
}

/** Deterministic small offset so multiple hits in a country don't overlap. */
export function jitter(coord: [number, number], seed: number): [number, number] {
  const r = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 10000;
    return x - Math.floor(x);
  };
  return [coord[0] + (r(1) - 0.5) * 6, coord[1] + (r(2) - 0.5) * 4];
}
