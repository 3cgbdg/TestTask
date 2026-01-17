'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  // not using url route - "/" so redirect to /events
  useEffect(() => {
    router.push('/events');
  }, [router]);

  return null;
}
