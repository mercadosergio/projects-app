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

export function ProjectForm({ isUpdate, project, isOpen, onOpenChange }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    priority: project?.priority || 'medium',
    dueDate: project?.dueDate || '',
    team: project?.team || [],
    collaboratorsId: project?.collaborators
      ? project.collaborators.map((c) => c.id)
      : []
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
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  // if (loading) return <p>Cargando usuarios...</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // setErrors({ ...errors, [e.target.name]: '' });
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (!isUpdate) {
      console.log('Crear');
    } else {
      console.log('Editar');
    }
  };

  const create = () => {};

  const update = () => {};

  const addCollaborator = (id) => {
    if (!form.collaboratorsId.includes(id)) {
      setForm({
        ...form,
        collaboratorsId: [...form.collaboratorsId, id]
      });
    }
  };

  const removeTeamMember = (memberId) => {
    setForm({
      ...form,
      team: form.team.filter((id) => id !== memberId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[625px]'>
        <form onSubmit={submitForm}>
          <DialogHeader>
            <DialogTitle>
              {isUpdate ? 'Editar proyecto' : 'Crear proyecto'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-900'>
              Nombre
            </label>
            <input
              id='name'
              name='name'
              type='text'
              value={form.name}
              onChange={handleChange}
              placeholder='Ingresa el nombre del proyecto'
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
              placeholder='Describe el proyecto y sus objetivos'
              rows={3}
              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {/* <div className='space-y-2'>
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
                {priorities.map((priority) => (
                  <option
                    selected={priority.name === project.priority}
                    key={priority.id}
                    value={priority.name}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div> */}

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
                  value={form.dueDate}
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
              Colaboradores
            </label>

            {users.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {users
                  .filter((user) => form.collaboratorsId.includes(user.id))
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
              <label className='text-sm text-gray-500'>Agregar miembros:</label>
              <div className='flex flex-wrap gap-2'>
                {users
                  .filter((user) => !form.collaboratorsId.includes(user.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      type='button'
                      onClick={() => addCollaborator(user.id)}
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
