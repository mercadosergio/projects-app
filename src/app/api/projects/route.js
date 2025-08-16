if (!global.projects) {
  global.projects = [
    {
      id: 1,
      name: 'Proyecto Alpha',
      description: 'Desarrollo de la nueva aplicación web',
      completeDate: '2025-09-30',
      createdAt: '2025-12-15',
      collaborators: [
        { id: 1, name: 'Juan' },
        { id: 2, name: 'María' }
      ],
      tasks: [
        {
          id: 1,
          title: 'Tarea 1',
          description: 'lorem ipsuma asdas das dsad sad',
          status: 'IN_PROGRESS',
          priority: '',
          completeDate: '2025-09-30',
          createdAt: '2025-09-30',
          owners: [
            { id: 1, name: 'Juan' },
            { id: 2, name: 'María' }
          ]
        },
        {
          id: 2,
          title: 'Tarea 2',
          description: 'lorem ipsuma asdas das dsad sad',
          status: 'COMPLETED',
          priority: '',
          completeDate: '2025-09-30',
          createdAt: '2025-09-30',
          owners: [
            { id: 1, name: 'Juan' },
            { id: 2, name: 'María' }
          ]
        }
      ],
      team: ['JD', 'AM', 'CS']
    },
    {
      id: 2,
      name: 'Proyecto Beta',
      description: 'Migración a la nube AWS',
      completeDate: '2025-12-15',
      createdAt: '2025-12-15',
      collaborators: [{ id: 3, name: 'Pedro' }],
      tasks: [],
      team: ['RG', 'LM', 'PH']
    }
  ];
}

let projects = global.projects;
let projectIdCounter = projects.length + 1;

export async function GET() {
  return Response.json(projects);
}

export async function POST(req) {
  const {
    nombre,
    descripcion,
    fechaLimite,
    colaboradores = []
  } = await req.json();

  if (!nombre || !descripcion || !fechaLimite) {
    return Response.json(
      { error: 'Todos los campos son requeridos' },
      { status: 400 }
    );
  }

  const newProject = {
    id: projectIdCounter++,
    nombre,
    descripcion,
    fechaLimite,
    colaboradores,
    progreso: 0,
    tareas: []
  };

  projects.push(newProject);
  return Response.json(newProject, { status: 201 });
}
