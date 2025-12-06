'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dashStyles from '@/styles/AnalyticsDashboard.module.css';
import styles from '@/styles/CampaignBreakdown.module.css';
import type { AnalyticsData } from '@/types';

export default function CampaignBreakdown({
  analytics,
}: {
  analytics: AnalyticsData;
}) {
  const sources = analytics.topSources ?? [];
  const mediums = analytics.topMediums ?? [];
  const campaigns = analytics.topCampaigns ?? [];
  const hasData = sources.length || mediums.length || campaigns.length;

  if (!hasData) {
    return (
      <div className={styles.card}>
        <h3>Campaigns</h3>
        <p className={styles.empty}>
          No campaign data yet. Tag inbound links with utm_source / utm_medium
          / utm_campaign to see attribution here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3>Traffic Sources</h3>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sources}>
            <XAxis dataKey="source" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0070f3" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={dashStyles.tablesRow}>
        <div className={dashStyles.tableCard}>
          <h3>Top Mediums</h3>
          <div className={dashStyles.table}>
            {mediums.length === 0 ? (
              <p className={dashStyles.emptyTable}>No medium data</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Medium</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {mediums.map((m, i) => (
                    <tr key={i}>
                      <td>{m.medium}</td>
                      <td>{m.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={dashStyles.tableCard}>
          <h3>Top Campaigns</h3>
          <div className={dashStyles.table}>
            {campaigns.length === 0 ? (
              <p className={dashStyles.emptyTable}>No campaign data</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={i}>
                      <td>{c.campaign}</td>
                      <td>{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
