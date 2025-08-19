'use client';

import { toast } from 'sonner';

export function showToast(message) {
  toast('ProjectsApp', {
    description: message,
    action: {
      label: 'Aceptar'
      //   onClick: () => console.log('Undo')
    }
  });
}

export function showErrorToast(message) {
  toast.error(message);
}

export function showSuccessToast(message) {
  toast.success(message);
}
