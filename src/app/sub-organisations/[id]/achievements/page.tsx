'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MultiImageUpload } from '@/components/ui/MultiImageUpload';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  image_urls?: string[] | null;
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

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);

  // Lightbox / Image Preview state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`/api/suborgs/${subOrgId}/achievements`);
      const data = await res.json();
      if (data.data) setAchievements(data.data);
    } catch (err: any) {
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
      } catch (err: any) {
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
    setFeedback(null);

    try {
      const res = await fetch(`/api/suborgs/${subOrgId}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          description, 
          image_urls: imageUrls,
          image_url: imageUrls[0] || null 
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save achievement');
      }

      setTitle('');
      setDescription('');
      setImageUrls([]);
      setShowForm(false);
      await fetchAchievements();

      if (resData.warning) {
        setFeedback({ type: 'warning', message: resData.warning });
      } else {
        setFeedback({ type: 'success', message: 'Achievement saved successfully!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving achievement' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete');
      }
      await fetchAchievements();
      setFeedback({ type: 'success', message: 'Achievement deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete' });
    }
  };

  const startEdit = (a: Achievement) => {
    setEditingId(a.id);
    setEditTitle(a.title);
    setEditDescription(a.description);
    const existingImgs = Array.isArray(a.image_urls) && a.image_urls.length > 0
      ? a.image_urls
      : a.image_url ? [a.image_url] : [];
    setEditImageUrls(existingImgs);
    setFeedback(null);
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editTitle, 
          description: editDescription, 
          image_urls: editImageUrls,
          image_url: editImageUrls[0] || null 
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update achievement');
      }

      setEditingId(null);
      await fetchAchievements();
      setFeedback({ type: 'success', message: 'Achievement updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating achievement' });
    } finally {
      setSaving(false);
    }
  };

  const getAchievementImages = (a: Achievement): string[] => {
    if (Array.isArray(a.image_urls) && a.image_urls.length > 0) return a.image_urls;
    if (a.image_url) return [a.image_url];
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/sub-organisations" className="text-purple-400 hover:text-purple-300 text-sm transition-colors inline-flex items-center gap-1.5 font-medium">
          ← Back to Sub Organisations
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Achievements</h1>
          {subOrg && (
            <p className="bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 bg-clip-text text-transparent mt-1 text-lg font-semibold">
              {subOrg.name}
            </p>
          )}
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full mt-2" />
        </div>
        {isAdmin && (
          <Button onClick={() => { setShowForm(!showForm); setFeedback(null); }}>
            {showForm ? 'Cancel' : '+ Add Achievement'}
          </Button>
        )}
      </div>

      {/* Global feedback message */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm flex items-start justify-between border ${
            feedback.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : feedback.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-3 text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && isAdmin && (
        <Card className="mb-8 border-purple-500/40 shadow-[0_0_25px_rgba(124,58,237,0.2)]">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>New Achievement</span>
          </h3>
          <form onSubmit={handleAdd} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Achievement Images <span className="text-xs text-gray-500">(Upload one or multiple photos)</span>
              </label>
              <MultiImageUpload
                urls={imageUrls}
                onChange={setImageUrls}
                label="Add Photos"
                maxImages={12}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Achievement'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowForm(false); setFeedback(null); }}
              >
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
          No achievements yet for this sub-organisation.
        </Card>
      ) : (
        <div className="space-y-5">
          {achievements.map((a, i) => {
            const imgs = getAchievementImages(a);

            return (
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
                      <label className="block text-xs font-medium text-gray-400 mb-2">Achievement Images</label>
                      <MultiImageUpload
                        urls={editImageUrls}
                        onChange={setEditImageUrls}
                        label="Add More Photos"
                        maxImages={12}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={() => handleUpdate(a.id)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 text-purple-300 rounded-full flex items-center justify-center text-sm font-bold border border-purple-500/40 shadow-sm">
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-white">{a.title}</h3>
                          <span className="text-xs text-gray-500 block">
                            Added on {new Date(a.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="secondary" onClick={() => startEdit(a)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Button>
                        </div>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line pl-11">
                        {a.description}
                      </p>
                    )}

                    {/* Image Gallery */}
                    {imgs.length > 0 && (
                      <div className="pl-11 pt-2">
                        {imgs.length === 1 ? (
                          <div
                            onClick={() => setPreviewImage(imgs[0])}
                            className="relative max-w-md h-56 rounded-xl overflow-hidden border border-card-border bg-black/60 shadow-lg cursor-pointer group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgs[0]}
                              alt={a.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-3 py-1.5 rounded-lg bg-black/75 text-xs text-white backdrop-blur-sm border border-white/20">
                                🔍 Click to view full size
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
                              <span>📸 Photos ({imgs.length})</span>
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {imgs.map((imgUrl, imgIdx) => (
                                <div
                                  key={imgUrl + imgIdx}
                                  onClick={() => setPreviewImage(imgUrl)}
                                  className="relative aspect-video sm:aspect-square rounded-lg overflow-hidden border border-card-border bg-black/60 shadow-md cursor-pointer group"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={imgUrl}
                                    alt={`${a.title} - photo ${imgIdx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-xs text-white drop-shadow">🔍</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Full size preview"
              className="w-full h-full max-h-[85vh] object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-sm border border-white/20 shadow-lg cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
