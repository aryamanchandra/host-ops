import dashStyles from '@/styles/AnalyticsDashboard.module.css';
import styles from '@/styles/GeoMap.module.css';
import type { AnalyticsData } from '@/types';
import { countryCodeToFlag } from '@/helpers/geo';

export default function TopCountries({ analytics }: { analytics: AnalyticsData }) {
  const countries = analytics.countryBreakdown ?? [];
  const total = countries.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div className={dashStyles.tableCard}>
      <h3>Top Countries</h3>
      <div className={dashStyles.table}>
        {countries.length === 0 ? (
          <p className={dashStyles.emptyTable}>No location data yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {countries.slice(0, 10).map((c, i) => (
                <tr key={i}>
                  <td>
                    <span className={styles.countryCell}>
                      <span className={styles.flag}>
                        {countryCodeToFlag(c.countryCode)}
                      </span>
                      <span>{c.country}</span>
                      <span className={styles.pctBar}>
                        <span
                          className={styles.pctFill}
                          style={{ width: `${Math.round((c.count / total) * 100)}%` }}
                        />
                      </span>
                    </span>
                  </td>
                  <td>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
