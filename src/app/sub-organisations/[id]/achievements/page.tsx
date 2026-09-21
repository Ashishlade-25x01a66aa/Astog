'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface SubOrg {
  id: string;
  name: string;
}

export default function AchievementsPage() {
  const params = useParams();
  const subOrgId = params.id as string;
  const { isAdmin } = useAuth();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [subOrg, setSubOrg] = useState<SubOrg | null>(null);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`/api/suborgs/${subOrgId}/achievements`);
      const data = await res.json();
      if (data.data) setAchievements(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Get sub-org name
        const orgRes = await fetch('/api/suborgs');
        const orgData = await orgRes.json();
        const org = orgData.data?.find((o: SubOrg) => o.id === subOrgId);
        if (org) setSubOrg(org);

        await fetchAchievements();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subOrgId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/suborgs/${subOrgId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setShowForm(false);
        await fetchAchievements();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
      await fetchAchievements();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (a: Achievement) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditDescription(a.description);
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`/api/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      setEditingId(null);
      await fetchAchievements();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-astog-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/sub-organisations" className="text-astog-green hover:text-astog-green-hover text-sm transition-colors">
          ← Back to Sub Organisations
        </Link>
      </div>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Achievements</h1>
          {subOrg && <p className="text-astog-green mt-1 text-lg">{subOrg.name}</p>}
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Achievement'}
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && isAdmin && (
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">New Achievement</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green resize-none"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Achievement'}
            </Button>
          </form>
        </Card>
      )}

      {/* Achievements list */}
      {achievements.length === 0 ? (
        <Card className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          No achievements yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {achievements.map((a, i) => (
            <Card key={a.id}>
              {editingId === a.id ? (
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green resize-none"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(a.id)}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-astog-green/20 text-astog-green rounded-full flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                      {a.description && <p className="text-gray-400 mt-1 text-sm">{a.description}</p>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(a)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
