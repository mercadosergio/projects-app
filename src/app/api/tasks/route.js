import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

if (!global.tasks) {
  global.tasks = [
    {
      id: 1,
      title: 'Tarea 1',
      description: 'Configurar el entorno de desarrollo inicial',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: '2025-09-30',
      createdAt: '2025-08-10',
      projectId: 1,
      owners: [
        { id: 1, name: 'Juan' },
        { id: 2, name: 'María' }
      ]
    },
    {
      id: 2,
      title: 'Tarea 2',
      description: 'Diseñar la base de datos del proyecto',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '2025-10-05',
      createdAt: '2025-08-12',
      projectId: 1,
      owners: [{ id: 3, name: 'Pedro' }]
    },
    {
      id: 3,
      title: 'Tarea 3',
      description: 'Crear los componentes de UI principales',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: '2025-10-15',
      createdAt: '2025-08-14',
      projectId: 2,
      owners: [
        { id: 2, name: 'María' },
        { id: 4, name: 'Lucía' }
      ]
    },
    {
      id: 4,
      title: 'Tarea 4',
      description: 'Configurar el sistema de autenticación con JWT',
      status: 'COMPLETED',
      priority: 'HIGH',
      dueDate: '2025-09-01',
      createdAt: '2025-08-15',
      projectId: 2,
      owners: [{ id: 5, name: 'Sergio' }]
    },
    {
      id: 5,
      title: 'Tarea 5',
      description: 'Implementar el sistema de notificaciones',
      status: 'PENDING',
      priority: 'LOW',
      dueDate: '2025-11-01',
      createdAt: '2025-08-16',
      projectId: 2,
      owners: [
        { id: 6, name: 'Ana' },
        { id: 7, name: 'Diego' }
      ]
    }
  ];
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('project_id');

    let tasks = [];

    if (projectId) {
      const resp = await ddbDocClient.send(
        new QueryCommand({
          TableName: environment.DYNAMODB_TABLENAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
          ExpressionAttributeValues: {
            ':pk': `PROJECT#${projectId}`,
            ':sk': 'TASK#'
          }
        })
      );
      tasks = resp.Items || [];
    } else {
      const resp = await ddbDocClient.send(
        new ScanCommand({
          TableName: environment.DYNAMODB_TABLENAME,
          FilterExpression: 'begins_with(PK, :pk) AND begins_with(SK, :sk)',
          ExpressionAttributeValues: {
            ':pk': 'PROJECT#',
            ':sk': 'TASK#'
          }
        })
      );
      tasks = resp.Items || [];
    }

    const result = tasks.map((task) => ({
      ...task,
      id: task.SK.split('#')[1]
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}

export async function POST(req) {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignees = []
    } = await req.json();

    if (
      !title ||
      !description ||
      !status ||
      !priority ||
      !dueDate ||
      !projectId
    ) {
      return ErrorResponse('Campos faltantes', 400);
    }

    const taskId = uuid();
    const createdAt = new Date().toISOString();

    await ddbDocClient.send(
      new PutCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Item: {
          PK: `PROJECT#${projectId}`,
          SK: `TASK#${taskId}`,
          title,
          description,
          status,
          priority,
          dueDate,
          createdAt,
          projectId
        }
      })
    );

    if (assignees.length > 0) {
      const requests = assignees.map((userId) => ({
        PutRequest: {
          Item: {
            PK: `USER#${userId}`,
            SK: `TASK#${taskId}`,
            projectId,
            userId,
            taskId
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
        message: 'Tarea creada con éxito',
        taskId
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
