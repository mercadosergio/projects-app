'use client';

import { changeStatus } from '@/app/actions/task-actions';
import { STATUSES } from '@/utils/app/types';
import clsx from 'clsx';
import { useState } from 'react';

export function SelectStatus({ task, color }) {
  const [status, setStatus] = useState('IN_PROGRESS');

  const handleChange = async (e) => {
    setStatus(e.target.value);

    try {
      const formData = new FormData();
      formData.append('id', task.id);
      formData.append('status', status);
      formData.append('projectId', task.projectId);
      const result = await changeStatus(formData);

      if (result) {
        console.log('Done change');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <select
      id='priority'
      name='priority'
      value={status}
      onChange={handleChange}
      className={clsx(
        'w-full h-9 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white',
        `${color}`
      )}>
      {STATUSES.map((status) => (
        <option key={status.id} value={status.name}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
