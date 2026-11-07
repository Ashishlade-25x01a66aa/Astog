'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
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
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

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
        body: JSON.stringify({ 
          title, 
          description, 
          image_url: imageUrl || null 
        }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setImageUrl('');
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
    setEditImageUrl(a.image_url || '');
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`/api/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editTitle, 
          description: editDescription, 
          image_url: editImageUrl || null 
        }),
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
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/sub-organisations" className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-1.5 font-medium">
          ← Back to Sub Organisations
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Achievements</h1>
          {subOrg && (
            <p className="bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mt-1 text-lg font-semibold">
              {subOrg.name}
            </p>
          )}
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mt-2" />
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Achievement'}
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && isAdmin && (
        <Card className="mb-8 border-purple-500/40 shadow-[0_0_25px_rgba(124,58,237,0.2)]">
          <h3 className="text-xl font-semibold text-white mb-4">New Achievement</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g. Industry Innovation Excellence Award"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                placeholder="Details about the accomplishment or milestone..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Achievement Image (Optional)</label>
              <ImageUpload
                currentUrl={imageUrl}
                onUpload={(url) => setImageUrl(url)}
                label="Upload Image"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Achievement'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Achievements list */}
      {achievements.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          No achievements yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {achievements.map((a, i) => (
            <Card key={a.id} className="hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)] transition-all">
              {editingId === a.id ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-purple-400">Edit Achievement</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Achievement Image</label>
                    <ImageUpload
                      currentUrl={editImageUrl}
                      onUpload={(url) => setEditImageUrl(url)}
                      label="Change Image"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => handleUpdate(a.id)}>Save Changes</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-5 flex-grow">
                    <span className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 text-purple-300 rounded-full flex items-center justify-center text-sm font-bold border border-purple-500/40 shadow-sm">
                      {i + 1}
                    </span>
                    {a.image_url && (
                      <div className="relative w-full sm:w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden border border-card-border bg-black/60 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.image_url}
                          alt={a.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white mb-2">{a.title}</h3>
                      {a.description && (
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {a.description}
                        </p>
                      )}
                      <span className="text-xs text-gray-500 mt-2 block">
                        Added on {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-start">
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
