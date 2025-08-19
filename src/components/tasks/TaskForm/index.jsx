'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { createTask, updateTask } from '@/app/actions/task-actions';
import { PRIORITIES } from '@/utils/app/types';
import toast from 'react-hot-toast';

export function TaskForm({ isUpdate, task, isOpen, onOpenChange, projectId }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || tomorrow.toISOString().split('T')[0],
    status: task?.status || 'IN_PROGRESS',
    assignees: task?.assignees ? task.assignees.map((c) => c.id) : []
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();

        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: tomorrow.toISOString().split('T')[0],
      status: 'IN_PROGRESS'
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('priority', form.priority);
    formData.append('dueDate', form.dueDate);
    formData.append('status', form.status);
    formData.append('projectId', projectId);

    if (!isUpdate) {
      await create(formData);
    } else {
      await update(task.id, formData);
    }
  };

  const create = async (formData) => {
    try {
      const result = await createTask(formData);
      if (result) {
        resetForm();
        toast.success('Guardado exitoso!');
        onOpenChange();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const update = async (id, formData) => {
    try {
      const result = await updateTask(id, formData);
      if (result) {
        resetForm();
        onOpenChange();
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const addAssignee = (id) => {
    if (!form.assignees.includes(id)) {
      setForm({
        ...form,
        assignees: [...form.assignees, id]
      });
    }
  };

  const removeTeamMember = (memberId) => {
    setForm({
      ...form,
      assignees: form.assignees.filter((id) => id !== memberId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[625px]'>
        <form onSubmit={submitForm}>
          <DialogHeader>
            <DialogTitle>
              {isUpdate ? 'Editar tarea' : 'Crear tarea'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-900'>
              Nombre
            </label>
            <input
              id='title'
              name='title'
              type='text'
              value={form.title}
              onChange={handleChange}
              placeholder='Ingresa el titulo'
              required
              className='w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-900'>
              Descripción
            </label>
            <textarea
              id='description'
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='Ingresa la descripción'
              rows={3}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label
                htmlFor='priority'
                className='block text-sm font-medium text-gray-900'>
                Prioridad
              </label>
              <select
                id='priority'
                name='priority'
                value={form.priority}
                onChange={handleChange}
                className='w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'>
                {PRIORITIES.map((priority) => (
                  <option key={priority.id} value={priority.name}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='dueDate'
                className='block text-sm font-medium text-gray-900'>
                Fecha Límite
              </label>
              <div className='relative'>
                <input
                  id='dueDate'
                  name='dueDate'
                  type='date'
                  value={
                    task?.dueDate
                      ? new Date(task.dueDate).toISOString().split('T')[0]
                      : tomorrow.toISOString().split('T')[0]
                  }
                  onChange={handleChange}
                  required
                  className='w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <FontAwesomeIcon
                  icon={faCalendar}
                  className='absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none'
                />
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <label className='block text-sm font-medium text-gray-900'>
              Responsables
            </label>

            {isUpdate && users.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {users
                  .filter((user) => form.assignees.includes(user.id))
                  .map((user) => {
                    return (
                      <span
                        key={user.id}
                        className='inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-md border'>
                        {user?.name}
                        <button
                          type='button'
                          onClick={() => removeTeamMember(user)}
                          className='ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors'>
                          <FontAwesomeIcon icon={faX} className='h-3 w-3' />
                        </button>
                      </span>
                    );
                  })}
              </div>
            )}

            <div className='space-y-2'>
              <label className='text-sm text-gray-500'>
                Agregar responsables:
              </label>
              <div className='flex flex-wrap gap-2'>
                {users.length > 0 &&
                  users
                    .filter((user) => !form.assignees.includes(user.id))
                    .map((user) => (
                      <button
                        key={user.id}
                        type='button'
                        onClick={() => addAssignee(user.id)}
                        className='inline-flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'>
                        <FontAwesomeIcon icon={faPlus} className='h-3 w-3' />
                        {user.name}
                      </button>
                    ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Cancelar</Button>
            </DialogClose>
            <Button type='submit'>
              {isUpdate ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
