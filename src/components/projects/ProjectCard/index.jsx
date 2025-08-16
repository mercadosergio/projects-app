import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { useState } from 'react';

export function ProjectCard({ project, onOpenForm }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
      <Card className='project-card-hover'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <CardTitle className='text-lg'>{project.name}</CardTitle>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSelectedProject(project)}>
              <FontAwesomeIcon className='h-4 w-4' icon={faEye} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-gray-500 line-clamp-2'>
            {project.description}
          </p>

          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progreso</span>
              <span className='font-medium'>{progress}%</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-500'>
              {completedTasks}/{totalTasks} tareas
            </span>
            <span className='text-gray-500'>Vence: {project.completeDate}</span>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex -space-x-2'>
              {project.team.slice(0, 3).map((member, index) => (
                <Avatar key={index} className='h-6 w-6 border-2 border-white'>
                  <AvatarFallback className='text-xs'>{member}</AvatarFallback>
                </Avatar>
              ))}
              {project.team.length > 3 && (
                <div className='h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center'>
                  <span className='text-xs text-gray-500'>
                    +{project.team.length - 3}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onOpenForm('UPDATE', project)}>
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6'>
            {/* <ProjectDetail
              project={selectedProject}
              onEdit={() => {
                setSelectedProject(null);
                handleEditProject(selectedProject);
              }}
              onDelete={() => handleDeleteProject(selectedProject.id)}
              onClose={() => setSelectedProject(null)}
            /> */}
          </div>
        </div>
      )}
    </>
  );
}
