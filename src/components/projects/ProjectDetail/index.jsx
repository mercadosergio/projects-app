import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  faBarChart,
  faBell,
  faCalendar,
  faCheckCircle,
  faClock
} from '@fortawesome/free-regular-svg-icons';
import { faLock, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function ProjectDetail({ project, isOpen, onOpenChange }) {
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-chart-3';
      case 'IN_PROGRESS':
        return 'text-accent';
      case 'PENDING':
        return 'text-muted-foreground';
      case 'BLOCKED':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <FontAwesomeIcon icon={faCheckCircle} className='h-4 w-4' />;
      case 'IN_PROGRESS':
        return <FontAwesomeIcon icon={faClock} className='h-4 w-4' />;
      case 'PENDING':
        return <FontAwesomeIcon icon={faBell} className='h-4 w-4' />;
      case 'BLOCKED':
        return <FontAwesomeIcon icon={faLock} className='h-4 w-4' />;
      default:
        return <FontAwesomeIcon icon={faBell} className='h-4 w-4' />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-6xl'>
        <DialogHeader>
          <DialogTitle>{project.name}</DialogTitle>
          <DialogDescription>{project.description}</DialogDescription>
        </DialogHeader>
        <div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <FontAwesomeIcon
                    icon={faBarChart}
                    className='h-4 w-4 text-primary'
                  />
                  <span className='text-sm font-medium'>Progreso</span>
                </div>
                <div className='mt-2'>
                  <div className='text-2xl font-bold'>{progress}%</div>
                  <Progress value={progress} className='mt-2' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className='h-4 w-4 text-chart-3'
                  />
                  <span className='text-sm font-medium'>Tareas</span>
                </div>
                <div className='mt-2'>
                  <div className='text-2xl font-bold'>
                    {completedTasks}/{totalTasks}
                  </div>
                  <p className='text-xs text-muted-foreground'>Completadas</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <FontAwesomeIcon
                    icon={faUsers}
                    className='h-4 w-4 text-accent'
                  />
                  <span className='text-sm font-medium'>Equipo</span>
                </div>
                <div className='mt-2'>
                  <div className='text-2xl font-bold'>
                    {project.collaborators.length}
                  </div>
                  <p className='text-xs text-muted-foreground'>Miembros</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2'>
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className='h-4 w-4 text-destructive'
                  />
                  <span className='text-sm font-medium'>Fecha Límite</span>
                </div>
                <div className='mt-2'>
                  <div className='text-lg font-bold'>{project.dueDate}</div>
                  <p className='text-xs text-muted-foreground'>Vencimiento</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>Tareas</h3>
            </div>
            <div className='space-y-3'>
              {project.tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                        </div>
                        <div>
                          <h4 className='font-medium'>{task.title}</h4>
                          <p className='text-sm text-muted-foreground'>
                            Asignado a: {task.assignee} • Vence: {task.dueDate}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getPriorityColor(task.priority)}>
                        {task.priority === 'high'
                          ? 'Alta'
                          : task.priority === 'medium'
                          ? 'Media'
                          : 'Baja'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
