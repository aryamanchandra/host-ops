'use client';

import { useState } from 'react';
import { useAuth, useOrg, useOrgMembers } from '@/hooks';
import type { OrgRole } from '@/types/org';
import styles from '@/styles/Team.module.css';

export default function TeamPage() {
  const { token } = useAuth();
  const { currentOrg, currentOrgId } = useOrg(token);
  const { members, invites, loading, invite, updateRole, removeMember } =
    useOrgMembers(token, currentOrgId);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('member');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      const r = await invite(email, role);
      setMsg(`Invite created. Share this link: ${r.inviteUrl}`);
      setEmail('');
    } catch (e: any) {
      setErr(e.message || 'Failed to send invite');
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Team</h1>
      <p className={styles.sub}>{currentOrg?.name || 'Your workspace'}</p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Invite a member</h2>
        <form className={styles.inviteForm} onSubmit={sendInvite}>
          <input
            type="email"
            placeholder="email@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Send invite</button>
        </form>
        {msg && <p className={styles.ok}>{msg}</p>}
        {err && <p className={styles.err}>{err}</p>}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Members</h2>
        {loading ? (
          <p className={styles.muted}>Loading…</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.userId}>
                  <td>
                    <div className={styles.member}>
                      <strong>{m.name || m.email || m.userId}</strong>
                      {m.email && <span>{m.email}</span>}
                    </div>
                  </td>
                  <td>
                    <select
                      value={m.role}
                      onChange={(e) => updateRole(m.userId, e.target.value as OrgRole)}
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td>
                    <button className={styles.remove} onClick={() => removeMember(m.userId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {invites.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Pending invites</h2>
          <ul className={styles.invites}>
            {invites.map((i: any) => (
              <li key={i._id || i.token}>
                {i.email} · {i.role}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
