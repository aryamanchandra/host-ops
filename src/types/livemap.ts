export interface LiveVisitorPing {
  id: string;
  countryCode: string;
  country?: string;
  city?: string;
  timestamp: string;
}

export interface CountryCount {
  countryCode: string;
  country: string;
  count: number;
}

export interface LiveVisitors {
  pings: LiveVisitorPing[];
  countries: CountryCount[];
  windowSeconds: number;
}
