import dashStyles from '@/styles/AnalyticsDashboard.module.css';
import type { AnalyticsData } from '@/types';

interface Props {
  analytics: AnalyticsData;
}

export default function BreakdownTables({ analytics }: Props) {
  const osBreakdown = analytics.osBreakdown ?? [];
  const browserVersions = analytics.browserVersionBreakdown ?? [];

  return (
    <div className={dashStyles.tablesRow}>
      <div className={dashStyles.tableCard}>
        <h3>Operating Systems</h3>
        <div className={dashStyles.table}>
          {osBreakdown.length === 0 ? (
            <p className={dashStyles.emptyTable}>No OS data yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Visits</th>
                </tr>
              </thead>
              <tbody>
                {osBreakdown.map((o, i) => (
                  <tr key={i}>
                    <td>{o.os}</td>
                    <td>{o.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={dashStyles.tableCard}>
        <h3>Top Browser Versions</h3>
        <div className={dashStyles.table}>
          {browserVersions.length === 0 ? (
            <p className={dashStyles.emptyTable}>No browser data yet</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Browser</th>
                  <th>Visits</th>
                </tr>
              </thead>
              <tbody>
                {browserVersions.map((b, i) => (
                  <tr key={i}>
                    <td>
                      <span className={dashStyles.versionPill}>
                        {b.browser}
                        {b.version && b.version !== 'Unknown' ? (
                          <span className={dashStyles.monoCell}>{b.version}</span>
                        ) : null}
                      </span>
                    </td>
                    <td>{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
