'use server';

import { environment } from '@/config/environment';
import { revalidatePath } from 'next/cache';

const URL = `${environment.API_URL}/projects`;

export async function createProject(formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(object)
    });

    if (!res.ok) throw new Error('Error creando proyecto');
    const result = await res.json();

    revalidatePath('/projects');

    return result;
  } catch (err) {
    console.error('createProject error:', err);
    throw err;
  }
}

export async function updateProject(id, formData) {
  try {
    const object = Object.fromEntries(formData);

    const res = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(object),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Error actualizando proyecto');
    const result = await res.json();

    revalidatePath('/projects');

    return result;
  } catch (err) {
    console.error('updateProject error:', err);
    throw err;
  }
}

export async function deleteProject(id) {
  try {
    const res = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Error eliminando proyecto');
    const result = await res.json();

    revalidatePath('/projects');

    return result;
  } catch (err) {
    console.error('deleteProject error:', err);
    throw err;
  }
}
