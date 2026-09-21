'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface Employee {
  id: string;
  employee_number: number;
  photo_url: string;
  name: string;
  employee_id: string;
  company: string;
  role: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.data) setEmployees(data.data);
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
        <h1 className="text-4xl font-bold text-white">Employee Details</h1>
        {isAdmin && (
          <Link href="/admin">
            <Button>+ Add New Employee</Button>
          </Link>
        )}
      </div>

      {employees.length === 0 ? (
        <Card className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          No employees found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {employees.map((emp, index) => (
            <Card key={emp.id} className="flex flex-col sm:flex-row items-center gap-5 relative hover:border-astog-green transition-colors">
              <span className="flex-shrink-0 w-10 h-10 bg-astog-green/10 text-astog-green rounded-full flex items-center justify-center text-sm font-bold border border-astog-green/30">
                {index + 1}
              </span>
              <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-astog-green shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                {emp.photo_url ? (
                  <Image src={emp.photo_url} alt={emp.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-card-border flex items-center justify-center text-xl text-gray-500 font-bold">
                    {emp.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-white mb-0.5">{emp.name}</h3>
                <p className="text-astog-green font-medium text-sm">{emp.role}</p>
                <div className="text-gray-400 text-sm mt-1 space-y-0.5">
                  <p><span className="text-gray-500">ID:</span> {emp.employee_id}</p>
                  <p><span className="text-gray-500">Company:</span> {emp.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
