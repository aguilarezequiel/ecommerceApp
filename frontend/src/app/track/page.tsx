'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderTracking from '@/components/OrderTracking';

export default function TrackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderTracking initialCode={code || ''} />
    </div>
  );
}