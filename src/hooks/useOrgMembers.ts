import { useState, useEffect, useCallback } from 'react';
import type { OrgMemberView, OrgInviteView, OrgRole } from '@/types/org';

export function useOrgMembers(token: string, orgId: string) {
  const [members, setMembers] = useState<OrgMemberView[]>([]);
  const [invites, setInvites] = useState<OrgInviteView[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = useCallback(
    (): Record<string, string> => ({
      Authorization: `Bearer ${token}`,
      'x-org-id': orgId,
      'Content-Type': 'application/json',
    }),
    [token, orgId]
  );

  const fetchAll = useCallback(async () => {
    if (!token || !orgId) return;
    setLoading(true);
    try {
      const [mRes, iRes] = await Promise.all([
        fetch('/api/orgs/members', { headers: headers() }),
        fetch('/api/orgs/invites', { headers: headers() }),
      ]);
      if (mRes.ok) setMembers((await mRes.json()).members || []);
      if (iRes.ok) setInvites((await iRes.json()).invites || []);
    } finally {
      setLoading(false);
    }
  }, [token, orgId, headers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const invite = async (email: string, role: OrgRole) => {
    const res = await fetch('/api/orgs/invites', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send invite');
    await fetchAll();
    return data;
  };

  const updateRole = async (userId: string, role: OrgRole) => {
    const res = await fetch(`/api/orgs/members/${userId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update role');
    await fetchAll();
  };

  const removeMember = async (userId: string) => {
    const res = await fetch(`/api/orgs/members/${userId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove member');
    await fetchAll();
  };

  return { members, invites, loading, invite, updateRole, removeMember, refetch: fetchAll };
}
