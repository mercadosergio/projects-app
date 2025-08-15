'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Search, Filter, Eye, FolderOpen } from 'lucide-react';

const mockProjects = [
  {
    id: 1,
    name: 'Rediseño de Sitio Web',
    description: 'Actualización completa del sitio web corporativo',
    progress: 75,
    tasks: 12,
    completedTasks: 9,
    team: ['JD', 'AM', 'CS'],
    priority: 'high',
    deadline: '2024-01-15'
  },
  {
    id: 2,
    name: 'App Móvil E-commerce',
    description: 'Desarrollo de aplicación móvil para ventas online',
    progress: 45,
    tasks: 18,
    completedTasks: 8,
    team: ['RG', 'LM', 'PH'],
    priority: 'medium',
    deadline: '2024-02-28'
  },
  {
    id: 3,
    name: 'Sistema de Inventario',
    description: 'Implementación de sistema de gestión de inventario',
    progress: 20,
    tasks: 8,
    completedTasks: 2,
    team: ['MK', 'TN'],
    priority: 'low',
    deadline: '2024-03-30'
  }
];

export default function Proyectos() {
  const [projects, setProjects] = useState(mockProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      setProjects(
        projects.map((p) => (p.id === projectData.id ? projectData : p))
      );
    } else {
      setProjects([
        ...projects,
        { ...projectData, progress: 0, tasks: 0, completedTasks: 0 }
      ]);
    }
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    setSelectedProject(null);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      priorityFilter === 'all' || project.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Gestión de Proyectos</h1>
          <p className='text-gray-500'>
            Administra todos tus proyectos y su progreso
          </p>
        </div>
        <Button onClick={() => setShowProjectForm(true)}>
          <Plus className='h-4 w-4 mr-2' />
          Nuevo Proyecto
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
          <Input
            placeholder='Buscar proyectos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className='w-full sm:w-48'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Filtrar por prioridad' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todas las prioridades</SelectItem>
            <SelectItem value='high'>Alta prioridad</SelectItem>
            <SelectItem value='medium'>Media prioridad</SelectItem>
            <SelectItem value='low'>Baja prioridad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredProjects.map((project) => (
          <Card key={project.id} className='project-card-hover'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg'>{project.name}</CardTitle>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority === 'high'
                      ? 'Alta'
                      : project.priority === 'medium'
                      ? 'Media'
                      : 'Baja'}
                  </Badge>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSelectedProject(project)}>
                  <Eye className='h-4 w-4' />
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
                  <span className='font-medium'>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className='h-2' />
              </div>

              <div className='flex items-center justify-between text-sm'>
                <span className='text-gray-500'>
                  {project.completedTasks}/{project.tasks} tareas
                </span>
                <span className='text-gray-500'>Vence: {project.deadline}</span>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex -space-x-2'>
                  {project.team.slice(0, 3).map((member, index) => (
                    <Avatar
                      key={index}
                      className='h-6 w-6 border-2 border-white'>
                      <AvatarFallback className='text-xs'>
                        {member}
                      </AvatarFallback>
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
                  onClick={() => handleEditProject(project)}>
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className='text-center py-12'>
          <FolderOpen className='h-12 w-12 text-gray-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            No se encontraron proyectos
          </h3>
          <p className='text-gray-500 mb-4'>
            {searchTerm || priorityFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer proyecto'}
          </p>
          {!searchTerm && priorityFilter === 'all' && (
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Crear Primer Proyecto
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
