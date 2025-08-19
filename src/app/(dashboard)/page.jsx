import { ProyectsList } from '@/components/projects/ProjectsList';

export async function getProjects() {
  try {
    const response = await fetch('http://localhost:3000/api/projects', {
      cache: 'no-store'
    });

    const projects = await response.json();

    return projects;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  console.log(projects);

  return (
    <>
      <ProyectsList projects={projects} />
    </>
  );
}
