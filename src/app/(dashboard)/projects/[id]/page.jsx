import { TasksView } from '@/components/tasks/TasksView';
import { environment } from '@/config/environment';

export async function getTasksByProjectId(projectId) {
  try {
    const response = await fetch(
      `${environment.API_URL}/tasks?project_id=${projectId}`
    );
    if (!response.ok) throw new Error('Error al obtener tareas');

    const tasks = await response.json();

    return tasks;
  } catch (error) {
    throw error;
  }
}

export default async function ProjectPage({ params }) {
  const { id } = params;
  const tasksByProject = await getTasksByProjectId(id);

  return <TasksView tasks={tasksByProject} projectId={id} />;
}
