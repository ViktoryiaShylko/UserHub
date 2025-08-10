'use client';

import { Suspense } from 'react';
import HomeContent from './HomeContent';

export default function SearchParamsWrapper() {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <HomeContent />
    </Suspense>
  );
}