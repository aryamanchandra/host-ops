'use client';

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import type { LiveVisitorPing } from '@/types/livemap';
import { countryCentroid, jitter } from '@/helpers/centroids';
import styles from '@/styles/LiveMap.module.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function LiveVisitorMap({
  pings,
  newIds,
}: {
  pings: LiveVisitorPing[];
  newIds: Set<string>;
}) {
  // Cap markers per country so a busy country doesn't stack into a blob.
  const PER_COUNTRY = 12;
  const perCountry: Record<string, number> = {};
  const markers = pings
    .map((p, i) => {
      const c = countryCentroid(p.countryCode);
      if (!c) return null;
      perCountry[p.countryCode] = (perCountry[p.countryCode] || 0) + 1;
      if (perCountry[p.countryCode] > PER_COUNTRY) return null;
      return {
        id: p.id,
        coords: jitter(c, i + p.id.length),
        isNew: newIds.has(p.id),
      };
    })
    .filter(Boolean) as Array<{ id: string; coords: [number, number]; isNew: boolean }>;

  return (
    <div className={styles.mapWrap}>
      <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400}>
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#f0f0f0"
                stroke="#e0e0e0"
                strokeWidth={0.4}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map((m) => (
          <Marker key={m.id} coordinates={m.coords}>
            <circle r={5} className={`${styles.marker} ${m.isNew ? styles.markerNew : ''}`} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
