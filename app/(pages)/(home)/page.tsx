import App from '@/app/features/middlePanel/dashboard/ScheduleBoard';

export default function Home() {
  return (
    <main
      suppressHydrationWarning={true}
      className='flex min-h-screen flex-col items-center justify-between p-24'>
      <App />
    </main>
  );
}
