'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { STATUSES } from '@/utils/app/types';
import { faEllipsis, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { TaskForm } from '../TaskForm';
import { deleteTask } from '@/app/actions/task-actions';
import { SelectStatus } from '../SelectStatus';
import { LoadingOverlay } from '@/components/shared/Loading';

export function TasksView({ tasks, projectId }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setselectedTask] = useState(null);
  const [isFormUpdate, setIsFormUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const openForm = (mode, task) => {
    setIsFormOpen(true);
    setselectedTask(task);
    setIsFormUpdate(mode === 'CREATE' ? false : true);
  };

  const destroyForm = () => {
    setIsFormOpen(!isFormOpen);
    setselectedTask(null);
  };

  const removeTask = async (id) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('projectId', projectId);
      setLoading(true);
      const result = await deleteTask(formData);

      if (result) {
        console.log('Done delete');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <Button className='mb-3' onClick={() => openForm('CREATE', null)}>
        <FontAwesomeIcon icon={faPlus} className='h-4 w-4' />
        Nueva
      </Button>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start auto-rows-auto'>
        {STATUSES.map((status) => (
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
                    className={`p-2 hover:shadow-md transition-shadow task-priority-${
                      task.priority
                    } ${isOverdue(task.dueDate) ? 'border-red-500' : ''}`}>
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
                          <div>
                            <SelectStatus task={task} color={status.color} />
                          </div>
                          <DropdownMenuItem
                            onClick={() => openForm('UPDATE', task)}>
                            Editar
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => removeTask(task.id)}
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
                    No hay tareas hasta el momento
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <TaskForm
          isUpdate={isFormUpdate}
          task={selectedTask}
          isOpen={isFormOpen}
          onOpenChange={destroyForm}
          projectId={projectId}
        />
      )}

      {loading && <LoadingOverlay />}
    </div>
  );
}
