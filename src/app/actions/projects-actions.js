'use server';

import { environment } from '@/config/environment';

const URL = `${environment.API_URL}/projects`;

export async function createProject(formData) {
  try {
    const object = Object.fromEntries(formData);

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(object)
    });

    if (!response.ok) throw new Error('Error');
  } catch (error) {
    console.log(error);
  }
}

export async function updateProject(formData) {
  try {
  } catch (error) {}
}
