'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { HostManagementPage } from '@/components/pages/HostManagementPage';

/**
 * Host Manage Teams Route
 * Renders the HostManagementPage component with session and host IDs
 */
export default function HostManagePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const searchParams = useSearchParams();
  const hostId = searchParams.get('hostId');

  if (!hostId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Missing Host ID</h2>
          <p className="text-gray-600">
            Host ID is required to access this page. Please use the link provided when you created
            the session.
          </p>
        </div>
      </div>
    );
  }

  return <HostManagementPage sessionId={sessionId} hostId={hostId} />;
}
