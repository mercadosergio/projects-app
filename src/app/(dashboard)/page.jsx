import { ProyectsList } from '@/components/projects/ProjectsList';
import { environment } from '@/config/environment';

export async function getProjects() {
  try {
    const response = await fetch(`${environment.API_URL}/api/projects`);

    const projects = await response.json();

    return projects;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <ProyectsList projects={projects} />
    </>
  );
}
