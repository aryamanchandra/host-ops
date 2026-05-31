import { countryCodeToFlag } from '@/helpers/geo';
import type { CountryCount } from '@/types/livemap';
import styles from '@/styles/LiveMap.module.css';

export default function LiveCountryList({ countries }: { countries: CountryCount[] }) {
  return (
    <div className={styles.countryPanel}>
      <h3>Live by country</h3>
      {countries.length === 0 ? (
        <p className={styles.empty}>No live visitors right now</p>
      ) : (
        <ul className={styles.countryList}>
          {countries.map((c) => (
            <li key={c.countryCode}>
              <span>
                {countryCodeToFlag(c.countryCode)} {c.country}
              </span>
              <span className={styles.count}>{c.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
