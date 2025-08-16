'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { RealTimeNotifications } from '@/components/real-time-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faGear } from '@fortawesome/free-solid-svg-icons';

export function Header() {
  return (
    <header className='border-b border-gray-200 bg-white'>
      <div className='flex h-16 items-center justify-between px-6'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-lg bg-blue-700 flex items-center justify-center'>
              <FontAwesomeIcon
                className='h-5 w-5 text-white'
                icon={faChartBar}
              />
              ;
            </div>
            <h1 className='text-xl font-semibold text-gray-900'>TaskFlow</h1>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          {/* <RealTimeNotifications /> */}
          <Button variant='outline' size='sm'>
            <FontAwesomeIcon className='h-4 w-4 mr-2' icon={faGear} />
            Configuración
          </Button>
          <Avatar>
            <AvatarImage src='/generic-user-avatar.png' />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
