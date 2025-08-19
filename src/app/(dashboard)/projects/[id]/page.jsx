import { TasksView } from '@/components/tasks/TasksView';

export async function getTasksByProjectId(projectId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/tasks?project_id=${projectId}`
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
