'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ProjectCard } from '../ProjectCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { ProjectForm } from '../ProjectForm';

export function ProyectsList({ projects }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isFormUpdate, setIsFormUpdate] = useState(false);

  const openForm = (mode, project) => {
    setIsFormOpen(true);
    setSelectedProject(project);
    setIsFormUpdate(mode === 'CREATE' ? false : true);
  };

  const destroyForm = () => {
    setIsFormOpen(!isFormOpen);
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
          <h1 className='text-2xl font-bold'>Proyectos</h1>
        </div>
        <Button onClick={() => openForm('CREATE', null)}>
          <FontAwesomeIcon className='h-4 w-4 mr-2' icon={faPlus} />
          Nuevo Proyecto
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <FontAwesomeIcon
            icon={faSearch}
            className='absolute left-3 top-3 h-4 w-4 text-gray-500'
          />
          <Input
            placeholder='Buscar proyectos...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className='w-full sm:w-48'>
            <FontAwesomeIcon icon={faFilter} className='h-4 w-4 mr-2' />
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
          <ProjectCard
            onOpenForm={openForm}
            key={project.id}
            project={project}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className='text-center py-12'>
          <FontAwesomeIcon
            className='h-12 w-12 text-gray-500 mx-auto mb-4'
            icon={faFolderOpen}
          />
          <h3 className='text-lg font-semibold mb-2'>
            No se encontraron proyectos
          </h3>
          <p className='text-gray-500 mb-4'>
            {searchTerm || priorityFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer proyecto'}
          </p>
          {!searchTerm && priorityFilter === 'all' && (
            <Button onClick={() => openForm('CREATE', null)}>
              <FontAwesomeIcon className='h-4 w-4 mr-2' icon={faPlus} />
              Crear Primer Proyecto
            </Button>
          )}
        </div>
      )}

      {isFormOpen && (
        <ProjectForm
          isUpdate={isFormUpdate}
          project={selectedProject}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
        />
      )}
    </div>
  );
}
