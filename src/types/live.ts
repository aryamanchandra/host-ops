export interface LiveEvent {
  path: string;
  country?: string;
  countryCode?: string;
  device?: string;
  browser?: string;
  referer?: string;
  timestamp: string; // ISO string
}

export interface LiveAnalytics {
  activeVisitors: number; // unique IPs within the window
  viewsInWindow: number;
  windowSeconds: number;
  recentEvents: LiveEvent[];
}
