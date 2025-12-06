export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  topReferers: Array<{ referer: string; views: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  browserBreakdown: Array<{ browser: string; count: number }>;
  osBreakdown?: Array<{ os: string; count: number }>;
  browserVersionBreakdown?: Array<{ browser: string; version: string; count: number }>;
  countryBreakdown?: Array<{ country: string; countryCode: string; count: number }>;
  topCities?: Array<{ city: string; countryCode: string; count: number }>;
  topSources?: Array<{ source: string; count: number }>;
  topMediums?: Array<{ medium: string; count: number }>;
  topCampaigns?: Array<{ campaign: string; count: number }>;
  viewsByDate: Array<{ date: string; views: number }>;
}

