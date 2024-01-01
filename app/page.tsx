import Image from 'next/image';
import App from '@/app/components/App';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main
      suppressHydrationWarning={true}
      className='flex min-h-screen flex-col items-center justify-between p-24'>
      <App />
    </main>
  );
}
