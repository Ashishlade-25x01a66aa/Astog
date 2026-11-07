'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Sub Organisations', href: '/sub-organisations' },
    { name: 'Employees Details', href: '/employees' },
  ];

  return (
    <nav className="border-b border-card-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-white rounded-lg px-2.5 py-1 flex items-center shadow-md hover:shadow-purple-500/30 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/astelos-logo.png" alt="ASTELOS" className="h-7 w-auto object-contain" />
              </div>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive 
                          ? 'text-white bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-purple-500/40 shadow-[0_0_12px_rgba(124,58,237,0.25)]' 
                          : 'text-gray-300 hover:text-white hover:bg-card-border'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/admin">
              <Button variant="secondary" size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
