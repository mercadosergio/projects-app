'use client';

import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faChartBar,
  faCheckCircle,
  faFolder
} from '@fortawesome/free-regular-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

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
      href: '/',
      label: 'Tareas',
      icon: faCheckCircle
    },
    {
      href: '/',
      label: 'Equipo',
      icon: faUsers
    },
    {
      href: '/',
      label: 'Calendario',
      icon: faCalendar
    }
  ];

  return (
    <aside className='w-64 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)]'>
      <nav className='p-4 space-y-2'>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? 'default' : 'ghost'}
              className='w-full justify-start'
              asChild>
              <Link href={item.href}>
                <FontAwesomeIcon className='h-4 w-4 mr-2' icon={item.icon} />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
