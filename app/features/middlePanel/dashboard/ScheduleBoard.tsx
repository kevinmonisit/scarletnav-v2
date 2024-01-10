'use client';
import dynamic from 'next/dynamic';

const MultipleContainers = dynamic<{
  itemCount: number;
}>(
  () => import('@/app/features/middlePanel/dashboard/components/MultipleContainers').then(mod => mod.MultipleContainers), {
  ssr: false
});

export default function ScheduleBoard() {
  return (<MultipleContainers itemCount={5} />);
}
