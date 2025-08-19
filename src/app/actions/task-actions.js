'use server';

import { environment } from '@/config/environment';
import { revalidatePath } from 'next/cache';

const URL = `${environment.API_URL}/tasks`;

export async function createTask(formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(object)
    });

    const result = await res.json();

    revalidatePath(`/projects/${formData.get('project_id')}`);

    return result;
  } catch (err) {
    console.error('createTask error:', err);
    throw err;
  }
}

export async function updateTask(id, formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(object),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();

    revalidatePath(`/projects/${formData.get('project_id')}`);

    return result;
  } catch (err) {
    console.error('updateTask error:', err);
    throw err;
  }
}

export async function deleteTask(formData) {
  try {
    const res = await fetch(`${URL}/${formData.get('id')}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();

    revalidatePath(`/projects/${formData.get('projectId')}`);

    return result;
  } catch (err) {
    console.error('deleteTask error:', err);
    throw err;
  }
}

export async function changeStatus(formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}/${object.id}/change-status`, {
      method: 'PUT',
      body: JSON.stringify(object),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();

    revalidatePath(`/projects/${formData.get('projectId')}`);

    return result;
  } catch (err) {
    console.error('change status error:', err);
    throw err;
  }
}

export async function toAssignTask(formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}/${object.id}/assign`, {
      method: 'PUT',
      body: JSON.stringify(object),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();

    revalidatePath(`/projects/${formData.get('projectId')}`);

    return result;
  } catch (err) {
    console.error('change status error:', err);
    throw err;
  }
}
