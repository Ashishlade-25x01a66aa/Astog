'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/lib/AuthContext';

type Tab = 'home' | 'about' | 'suborgs' | 'employees';

export default function AdminPage() {
  const { isAdmin, setIsAdmin, checkSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setIsAdmin(true);
      await checkSession();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdmin(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-astog-green via-astog-green-hover to-astog-green" />
          <h2 className="text-2xl font-bold text-white text-center mb-2 mt-2">Admin Login</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Sign in to manage ASTOG</p>
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-astog-green transition-all"
                placeholder="admin@astog.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-astog-green transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" fullWidth disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'home', label: 'Home Content' },
    { key: 'about', label: 'About Entries' },
    { key: 'suborgs', label: 'Sub Organisations' },
    { key: 'employees', label: 'Employees' },
  ];

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all ASTOG content</p>
        </div>
        <Button variant="danger" onClick={handleLogout}>Logout</Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 bg-card-bg rounded-lg p-1 border border-card-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-astog-green text-black'
                : 'text-gray-400 hover:text-white hover:bg-card-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'home' && <HomeTab />}
      {activeTab === 'about' && <AboutTab />}
      {activeTab === 'suborgs' && <SubOrgsTab />}
      {activeTab === 'employees' && <EmployeesTab />}
    </div>
  );
}

/* ===== HOME TAB ===== */
function HomeTab() {
  const [welcomeText, setWelcomeText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/home').then(r => r.json()).then(d => {
      if (d.data) { setWelcomeText(d.data.welcome_text || ''); setLogoUrl(d.data.logo_url || ''); }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcome_text: welcomeText, logo_url: logoUrl }),
      });
      if (res.ok) setMsg('Saved!');
      else throw new Error('Failed to save');
    } catch (err: any) { setMsg(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-6">Home Page Content</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Welcome Text</label>
          <input
            value={welcomeText}
            onChange={(e) => setWelcomeText(e.target.value)}
            className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
          <ImageUpload currentUrl={logoUrl} onUpload={(url) => setLogoUrl(url)} label="Upload Logo" />
        </div>
        {msg && <p className={`text-sm ${msg === 'Saved!' ? 'text-astog-green' : 'text-red-400'}`}>{msg}</p>}
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </Card>
  );
}

/* ===== ABOUT TAB ===== */
function AboutTab() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', category: '', photo_url: '' });

  const fetchData = async () => {
    const res = await fetch('/api/about');
    const data = await res.json();
    if (data.data) setEntries(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: '', role: '', category: '', photo_url: '' }); setShowForm(false); setEditingId(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/about/${editingId}` : '/api/about';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    resetForm();
    await fetchData();
  };

  const handleEdit = (entry: any) => {
    setForm({ name: entry.name, role: entry.role, category: entry.category, photo_url: entry.photo_url || '' });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await fetch(`/api/about/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">About Entries ({entries.length})</h3>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ New Entry'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <InputField label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required />
              <InputField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo</label>
              <ImageUpload currentUrl={form.photo_url} onUpload={(url) => setForm({ ...form, photo_url: url })} />
            </div>
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">No entries yet.</Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="flex flex-col sm:flex-row items-center gap-4">
              {e.photo_url && <img src={e.photo_url} alt={e.name} className="w-16 h-16 rounded-full object-cover border border-astog-green" />}
              <div className="flex-grow text-center sm:text-left">
                <p className="text-white font-semibold">{e.name}</p>
                <p className="text-astog-green text-sm">{e.role}</p>
                <span className="text-xs text-gray-500 bg-card-border px-2 py-0.5 rounded-full">{e.category}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(e)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(e.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== SUB ORGS TAB ===== */
function SubOrgsTab() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', ceo_name: '', about_ceo: '', founded_on: '', logo_url: '' });

  const fetchData = async () => {
    const res = await fetch('/api/suborgs');
    const data = await res.json();
    if (data.data) setOrgs(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: '', ceo_name: '', about_ceo: '', founded_on: '', logo_url: '' }); setShowForm(false); setEditingId(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/suborgs/${editingId}` : '/api/suborgs';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    resetForm();
    await fetchData();
  };

  const handleEdit = (org: any) => {
    setForm({ name: org.name, ceo_name: org.ceo_name, about_ceo: org.about_ceo || '', founded_on: org.founded_on || '', logo_url: org.logo_url || '' });
    setEditingId(org.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sub-organisation and all its achievements?')) return;
    await fetch(`/api/suborgs/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Sub Organisations ({orgs.length})</h3>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ New Org'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <InputField label="CEO Name" value={form.ceo_name} onChange={(v) => setForm({ ...form, ceo_name: v })} required />
              <InputField label="Founded On" value={form.founded_on} onChange={(v) => setForm({ ...form, founded_on: v })} type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">About CEO</label>
              <textarea
                value={form.about_ceo}
                onChange={(e) => setForm({ ...form, about_ceo: e.target.value })}
                rows={3}
                className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
              <ImageUpload currentUrl={form.logo_url} onUpload={(url) => setForm({ ...form, logo_url: url })} />
            </div>
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      {orgs.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">No sub-organisations yet.</Card>
      ) : (
        <div className="space-y-3">
          {orgs.map((o) => (
            <Card key={o.id} className="flex flex-col sm:flex-row items-center gap-4">
              {o.logo_url && <img src={o.logo_url} alt={o.name} className="w-16 h-16 rounded-lg object-contain border border-card-border" />}
              <div className="flex-grow text-center sm:text-left">
                <p className="text-white font-semibold">{o.name}</p>
                <p className="text-gray-400 text-sm">CEO: {o.ceo_name}</p>
                {o.founded_on && <p className="text-gray-500 text-xs">Founded: {new Date(o.founded_on).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(o)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(o.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== EMPLOYEES TAB ===== */
function EmployeesTab() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', employee_id: '', company: '', role: '', photo_url: '' });

  const fetchData = async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    if (data.data) setEmployees(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: '', employee_id: '', company: '', role: '', photo_url: '' }); setShowForm(false); setEditingId(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/employees/${editingId}` : '/api/employees';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    resetForm();
    await fetchData();
  };

  const handleEdit = (emp: any) => {
    setForm({ name: emp.name, employee_id: emp.employee_id, company: emp.company || '', role: emp.role || '', photo_url: emp.photo_url || '' });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    await fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Employees ({employees.length})</h3>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : '+ Add Employee'}</Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <InputField label="Employee ID" value={form.employee_id} onChange={(v) => setForm({ ...form, employee_id: v })} required />
              <InputField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
              <InputField label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo</label>
              <ImageUpload currentUrl={form.photo_url} onUpload={(url) => setForm({ ...form, photo_url: url })} />
            </div>
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
          </form>
        </Card>
      )}

      {employees.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">No employees yet.</Card>
      ) : (
        <div className="space-y-3">
          {employees.map((emp, i) => (
            <Card key={emp.id} className="flex flex-col sm:flex-row items-center gap-4">
              <span className="w-8 h-8 bg-astog-green/20 text-astog-green rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
              {emp.photo_url && <img src={emp.photo_url} alt={emp.name} className="w-14 h-14 rounded-full object-cover border border-astog-green" />}
              <div className="flex-grow text-center sm:text-left">
                <p className="text-white font-semibold">{emp.name}</p>
                <p className="text-astog-green text-sm">{emp.role}</p>
                <p className="text-gray-500 text-xs">ID: {emp.employee_id} · {emp.company}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(emp)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== SHARED COMPONENTS ===== */
function InputField({ label, value, onChange, required, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-card-border rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-astog-green"
        required={required}
      />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-astog-green border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
