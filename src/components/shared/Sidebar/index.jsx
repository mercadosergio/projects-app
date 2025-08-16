'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faCheckCircle,
  faFolder
} from '@fortawesome/free-regular-svg-icons';
import clsx from 'clsx';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: faChartBar
    },
    {
      href: '/',
      label: 'Proyectos',
      icon: faFolder
    },
    {
      href: '/tasks',
      label: 'Tareas',
      icon: faCheckCircle
    }
  ];

  return (
    <aside className='w-64 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)]'>
      <nav className='p-4 space-y-2'>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              className={clsx(
                'hover:bg-app-orange/90 hover:text-white px-4 py-2 w-full justify-start inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                  ? 'bg-app-orange text-white'
                  : 'bg-transparent text-inherit'
              )}
              href={item.href}>
              <FontAwesomeIcon className='h-4 w-4 mr-2' icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
