'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='relative'>
          <FontAwesomeIcon icon={faBell} className='h-4 w-4' />
          {/* {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )} */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='min-w-96'></DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <div className='relative'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setShowNotifications(!showNotifications)}
        className='relative'>
        <FontAwesomeIcon icon={faBell} className='h-4 w-4' />
        {unreadCount > 0 && (
          <Badge
            variant='destructive'
            className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className='absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 shadow-lg'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Notificaciones</CardTitle>
              <div className='flex items-center gap-2'>
                {unreadCount > 0 && (
                  <Button variant='ghost' size='sm' onClick={markAllAsRead}>
                    Marcar todas como leídas
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowNotifications(false)}>
                  <FontAwesomeIcon icon={faX} className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-2 p-0'>
            {notifications.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(
                    notification.priority
                  )} ${
                    !notification.read ? 'bg-muted/50' : ''
                  } hover:bg-muted/30 cursor-pointer transition-colors`}
                  onClick={() => {
                    markAsRead(notification.id);
                    onNotificationClick?.(notification);
                  }}>
                  <div className='flex items-start gap-3'>
                    <div className='mt-0.5'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h4 className='text-sm font-medium truncate'>
                          {notification.title}
                        </h4>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs text-muted-foreground'>
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className='h-6 w-6 p-0'>
                            <FontAwesomeIcon icon={faX} className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <div className='w-2 h-2 bg-accent rounded-full mt-2' />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
