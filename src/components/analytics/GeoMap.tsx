'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import type { AnalyticsData } from '@/types';
import { colorScale } from '@/helpers/geo';
import styles from '@/styles/GeoMap.module.css';

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function GeoMap({ analytics }: { analytics: AnalyticsData }) {
  const breakdown = analytics.countryBreakdown ?? [];
  const [tooltip, setTooltip] = useState<{ name: string; count: number } | null>(
    null
  );

  if (breakdown.length === 0) {
    return (
      <div className={styles.mapCard}>
        <h3>Visitors by Country</h3>
        <p className={styles.empty}>No location data yet</p>
      </div>
    );
  }

  const byName = new Map(
    breakdown.map((c) => [c.country.toLowerCase(), c.count])
  );
  const max = Math.max(...breakdown.map((c) => c.count), 1);

  return (
    <div className={styles.mapCard}>
      <h3>Visitors by Country</h3>
      <div className={styles.mapWrap}>
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400}>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const name: string = geo.properties?.name || '';
                const count = byName.get(name.toLowerCase()) || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={count ? colorScale(count / max) : '#f5f5f5'}
                    stroke="#eaeaea"
                    strokeWidth={0.5}
                    onMouseEnter={() => setTooltip({ name, count })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#0070f3' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        {tooltip && (
          <div className={styles.tooltip}>
            {tooltip.name}: {tooltip.count.toLocaleString()} views
          </div>
        )}
      </div>
      <div className={styles.legend}>
        <span>Fewer</span>
        <span className={styles.legendBar} />
        <span>More</span>
      </div>
    </div>
  );
}
