export const revalidate = 21600;
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
