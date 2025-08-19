import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import {
  BatchGetCommand,
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

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
