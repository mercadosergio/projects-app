'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const statusColumns = [
  { id: 1, name: 'PENDING', label: 'Pendientes', color: 'bg-yellow-500' },
  { id: 2, name: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-orange-500' },
  { id: 3, name: 'BLOCKED', label: 'Bloqueadas', color: 'bg-gray-400' },
  { id: 4, name: 'COMPLETED', label: 'Completadas', color: 'bg-green-500' }
];

export function TasksView({ tasks }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onTaskStatusChange(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate !== '';
  };

  return (
    <div className='h-full'>
      <Button className='mb-3' onClick={() => setShowTaskForm(true)}>
        <FontAwesomeIcon icon={faPlus} className='h-4 w-4' />
        Nueva
      </Button>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start auto-rows-auto'>
        {statusColumns.map((status) => (
          <div
            key={status.id}
            className='flex flex-col rounded-lg bg-slate-200 p-2 h-auto self-start'
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status.id)}>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className='font-semibold'>{status.label}</h3>
              </div>
            </div>

            <div className='space-y-3 flex-1'>
              {tasks
                .filter((task) => task.status === status.name)
                .map((task) => (
                  <Card
                    key={task.id}
                    className={`p-2 cursor-move hover:shadow-md transition-shadow task-priority-${
                      task.priority
                    } ${isOverdue(task.dueDate) ? 'border-red-500' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}>
                    <div className='flex justify-between items-center'>
                      <CardTitle className='text-sm font-medium line-clamp-2'>
                        {task.title}
                      </CardTitle>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <FontAwesomeIcon
                              icon={faEllipsis}
                              className='h-4 w-4'
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => onTaskEdit(task)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onTaskDelete(task.id)}
                            className='text-red-500'>
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}

              {tasks.filter((task) => task.status === status.name).length ===
                0 && (
                <div className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg'>
                  <p className='text-sm text-gray-500'>
                    {status.name === 'PENDING'
                      ? 'Arrastra tareas aquí o crea una nueva'
                      : 'Arrastra tareas aquí'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
