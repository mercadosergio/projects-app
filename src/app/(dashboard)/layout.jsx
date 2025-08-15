import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <div className='flex'>
        <Sidebar />
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}
