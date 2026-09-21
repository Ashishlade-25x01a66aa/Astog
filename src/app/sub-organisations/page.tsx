'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

interface SubOrg {
  id: string;
  logo_url: string;
  name: string;
  ceo_name: string;
  about_ceo: string;
  founded_on: string;
}

export default function SubOrganisations() {
  const [subOrgs, setSubOrgs] = useState<SubOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetch('/api/suborgs')
      .then(res => res.json())
      .then(data => {
        if (data.data) setSubOrgs(data.data);
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
        <h1 className="text-4xl font-bold text-white">Sub Organisations</h1>
        {isAdmin && (
          <Link href="/admin">
            <Button>+ New One</Button>
          </Link>
        )}
      </div>

      {subOrgs.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          No sub organisations found.
        </Card>
      ) : (
        <div className="space-y-6">
          {subOrgs.map((org, index) => (
            <Card key={org.id} className="flex flex-col md:flex-row items-center md:items-start gap-6 hover:border-astog-green transition-colors">
              <div className="flex-shrink-0 flex items-center justify-center bg-astog-green/10 rounded-full w-12 h-12 text-xl font-bold text-astog-green border border-astog-green">
                {index + 1}
              </div>
              <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border border-card-border bg-black">
                {org.logo_url ? (
                  <Image src={org.logo_url} alt={org.name} fill className="object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-600 font-bold">
                    {org.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">{org.name}</h3>
                <div className="text-gray-300 text-sm leading-relaxed max-w-2xl space-y-1">
                  <p><span className="font-semibold text-astog-green">CEO:</span> {org.ceo_name}</p>
                  {org.about_ceo && <p><span className="font-semibold text-astog-green">About CEO:</span> {org.about_ceo}</p>}
                  {org.founded_on && <p><span className="font-semibold text-astog-green">Founded On:</span> {new Date(org.founded_on).toLocaleDateString()}</p>}
                </div>
                <div className="mt-4">
                  <Link href={`/sub-organisations/${org.id}/achievements`}>
                    <Button variant="secondary" size="sm">View Achievements →</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
