'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

export default function Home() {
  const [content, setContent] = useState<{ welcome_text: string; logo_url: string | null }>({ welcome_text: 'Welcome to ASTOG!', logo_url: null });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        if (data.data) setContent(data.data);
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
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl text-center space-y-8 py-12 px-8 relative overflow-hidden">
        {/* Green accent border */}
        <div className="absolute inset-0 border-[2px] border-astog-green/20 rounded-xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-astog-green to-transparent" />

        {/* Admin link */}
        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Link href="/admin">
              <Button variant="secondary" size="sm">Dashboard</Button>
            </Link>
          </div>
        )}

        {/* Welcome heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white animate-[fadeIn_0.6s_ease-out]">
          {content.welcome_text}
        </h1>
        
        {/* Logo */}
        {content.logo_url && (
          <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-2 border-astog-green shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Image src={content.logo_url} alt="ASTOG Logo" fill className="object-cover" />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/about">
            <Button size="lg" className="w-full sm:w-auto min-w-[180px]">About</Button>
          </Link>
          <Link href="/sub-organisations">
            <Button size="lg" className="w-full sm:w-auto min-w-[180px]">Sub Organisations</Button>
          </Link>
          <div className="flex flex-col items-center gap-2">
            <Link href="/employees">
              <Button size="lg" className="w-full sm:w-auto min-w-[180px]">Employees Details</Button>
            </Link>
            {isAdmin && (
              <Link href="/admin">
                <Button variant="secondary" size="sm">+ New One</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Admin button (top-right when not admin) */}
        {!isAdmin && (
          <div className="pt-4">
            <Link href="/admin">
              <Button variant="secondary" size="sm">Admin</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
