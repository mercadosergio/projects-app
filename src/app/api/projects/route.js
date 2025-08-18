export const runtime = 'nodejs';

import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import {
  BatchGetCommand,
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

if (!global.projects) {
  global.projects = [
    {
      id: 1,
      name: 'Proyecto Alpha',
      description: 'Desarrollo de la nueva aplicación web',
      dueDate: '2025-09-30',
      createdAt: '2025-12-15',
      collaborators: [
        {
          id: 1,
          name: 'Sergio Mercado',
          avatar: 'SM',
          email: 'mercadosergoi@gmail.com'
        },
        {
          id: 2,
          name: 'María González',
          avatar: 'MG',
          email: 'maria.gonzalez@example.com'
        }
      ],
      tasks: [
        {
          id: 1,
          title: 'Tarea 1',
          description: 'lorem ipsuma asdas das dsad sad',
          status: 'IN_PROGRESS',
          priority: '',
          dueDate: '2025-09-30',
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
          dueDate: '2025-09-30',
          createdAt: '2025-09-30',
          owners: [
            { id: 1, name: 'Juan' },
            { id: 2, name: 'María' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Proyecto Beta',
      description: 'Migración a la nube AWS',
      dueDate: '2025-12-15',
      createdAt: '2025-12-15',
      collaborators: [
        {
          id: 7,
          name: 'Felipe Castro',
          avatar: 'FC',
          email: 'felipe.castro@example.com'
        }
      ],
      tasks: []
    }
  ];
}

let projects = global.projects;
let projectIdCounter = projects.length + 1;

export async function GET() {
  try {
    const projectsResponse = await ddbDocClient.send(
      new ScanCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        FilterExpression: 'begins_with(PK, :pk) AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': 'PROJECT#',
          ':sk': 'METADATA#'
        }
      })
    );

    const projects = projectsResponse.Items || [];
    const results = await Promise.all(
      projects.map(async (project) => {
        const projectId = project.PK.split('#')[1];
        let collaborators = await getCollaborators(projectId);
        let tasks = await getProjectTasks(projectId);

        return {
          ...project,
          id: projectId,
          tasks,
          collaborators
        };
      })
    );
    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}

async function getCollaborators(projectId) {
  const collaboratorsRepsonse = await ddbDocClient.send(
    new QueryCommand({
      TableName: environment.DYNAMODB_TABLENAME,
      IndexName: 'ProjectUser',
      KeyConditionExpression: 'projectId = :pid',
      ExpressionAttributeValues: {
        ':pid': projectId
      }
    })
  );

  const relations = collaboratorsRepsonse.Items || [];

  const userKeys = relations.map((rel) => ({
    PK: `USER#${rel.userId}`,
    SK: `METADATA#${rel.userId}`
  }));

  const uniqueUserKeys = Array.from(
    new Map(userKeys.map((k) => [`${k.PK}|${k.SK}`, k])).values()
  );

  let collaborators = [];
  if (uniqueUserKeys.length > 0) {
    const batchResp = await ddbDocClient.send(
      new BatchGetCommand({
        RequestItems: {
          [environment.DYNAMODB_TABLENAME]: {
            Keys: uniqueUserKeys,
            ProjectionExpression: 'PK, SK, avatar'
          }
        }
      })
    );

    collaborators = batchResp.Responses[environment.DYNAMODB_TABLENAME].map(
      (user) => {
        const collabId = user.PK.split('#')[1];
        delete user.password;
        return { ...user, id: collabId };
      }
    );
  }

  return collaborators;
}

async function getProjectTasks(projectId) {
  const response = await ddbDocClient.send(
    new QueryCommand({
      TableName: environment.DYNAMODB_TABLENAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROJECT#${projectId}`,
        ':sk': 'TASK#'
      },
      ProjectionExpression: 'PK, SK'
    })
  );

  const tasks = response.Items || [];
  return tasks;
}

export async function POST(req) {
  try {
    const {
      name,
      description,
      dueDate,
      collaboratorsId = []
    } = await req.json();

    const projectId = uuid();
    const now = new Date().toISOString();

    if (!name || !description || !dueDate) {
      return ErrorResponse('Campos faltantes', 400);
    }

    await ddbDocClient.send(
      new PutCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Item: {
          PK: `PROJECT#${projectId}`,
          SK: `METADATA#${projectId}`,
          name,
          description,
          dueDate,
          createdAt: now
        }
      })
    );

    if (collaboratorsId.length > 0) {
      const requests = collaboratorsId.map((userId) => ({
        PutRequest: {
          Item: {
            PK: `USER#${userId}`,
            SK: `PROJECT#${projectId}`,
            projectId,
            userId
          }
        }
      }));

      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: requests
          }
        })
      );
    }

    return NextResponse.json(
      {
        message: 'Proyecto creado con éxito',
        projectId
      },
      { status: 201 }
    );
  } catch (error) {
    return ErrorResponse(error.message);
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const {
      name,
      description,
      dueDate,
      collaboratorsId = []
    } = await req.json();

    if (!name || !description || !dueDate) {
      return ErrorResponse('Campos faltantes', 400);
    }

    await ddbDocClient.send(
      new UpdateCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${id}`,
          SK: `METADATA#${id}`
        },
        UpdateExpression: 'SET #name = :name, #desc = :desc, #due = :due',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#desc': 'description',
          '#due': 'dueDate'
        },
        ExpressionAttributeValues: {
          ':name': name,
          ':desc': description,
          ':due': dueDate
        }
      })
    );

    const currentCollabs = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `USER#`,
          ':sk': `PROJECT#${id}`
        }
      })
    );

    if (collaboratorsId.length > 0) {
      const requests = collaboratorsId.map((userId) => ({
        PutRequest: {
          Item: {
            PK: `USER#${userId}`,
            SK: `PROJECT#${id}`,
            role: 'collaborator'
          }
        }
      }));

      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: requests
          }
        })
      );
    }

    return NextResponse.json(
      {
        message: 'Proyecto actualizado con éxito',
        projectId: id
      },
      { status: 200 }
    );
  } catch (error) {
    return ErrorResponse(error.message);
  }
}
