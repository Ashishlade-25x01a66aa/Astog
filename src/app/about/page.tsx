'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface AboutEntry {
  id: string;
  photo_url: string;
  name: string;
  role: string;
  category: string;
}

export default function About() {
  const [entries, setEntries] = useState<AboutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        if (data.data) setEntries(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-astog-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">About Us</h1>
        {isAdmin && (
          <Link href="/admin">
            <Button>+ New One</Button>
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          No entries found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {entries.map(entry => (
            <Card key={entry.id} className="flex flex-col items-center text-center hover:border-astog-green transition-colors">
              <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-2 border-astog-green shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                {entry.photo_url ? (
                  <Image src={entry.photo_url} alt={entry.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-card-border flex items-center justify-center text-3xl text-gray-500 font-bold">
                    {entry.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{entry.name}</h3>
              <p className="text-astog-green font-medium mb-1">{entry.role}</p>
              <span className="px-3 py-1 bg-card-border rounded-full text-xs text-gray-300 mt-2">{entry.category}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
