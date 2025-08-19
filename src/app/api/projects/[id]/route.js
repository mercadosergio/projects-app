import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import {
  BatchGetCommand,
  BatchWriteCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const projectResp = await ddbDocClient.send(
      new GetCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Key: {
          PK: `PROJECT#${id}`,
          SK: `METADATA#${id}`
        }
      })
    );
    if (!projectResp.Item) return ErrorResponse('Proyecto no encontrado', 404);
    const project = { ...projectResp.Item, id: id };

    const tasksResp = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `PROJECT#${id}`,
          ':sk': 'TASK#'
        }
      })
    );

    const tasks = (tasksResp.Items || []).map((task) => ({
      ...task,
      id: task.SK.split('#')[1]
    }));

    const relationsCollab = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        IndexName: 'ProjectUser',
        KeyConditionExpression: 'projectId = :pid',
        ExpressionAttributeValues: { ':pid': id }
      })
    );
    const relations = relationsCollab.Items || [];

    let collaborators = [];
    if (relations.length > 0) {
      const userKeys = Array.from(
        new Map(
          relations.map((rel) => [
            `USER#${rel.userId}`,
            { PK: `USER#${rel.userId}`, SK: `METADATA#${rel.userId}` }
          ])
        ).values()
      );

      const batchResp = await ddbDocClient.send(
        new BatchGetCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: {
              Keys: userKeys
              //   ProjectionExpression: 'PK, SK, name, avatar, email'
            }
          }
        })
      );

      collaborators =
        batchResp.Responses?.[environment.DYNAMODB_TABLENAME].map((u) => ({
          ...u,
          id: u.PK.split('#')[1]
        })) || [];
    }

    return NextResponse.json({
      ...project,
      tasks,
      collaborators
    });
  } catch (error) {
    console.error(error);
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
        Key: { PK: `PROJECT#${id}`, SK: `METADATA#${id}` },
        UpdateExpression: 'SET #n = :n, #d = :d, #due = :due',
        ExpressionAttributeNames: {
          '#n': 'name',
          '#d': 'description',
          '#due': 'dueDate'
        },
        ExpressionAttributeValues: {
          ':n': name,
          ':d': description,
          ':due': dueDate
        }
      })
    );

    const oldCollabs = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        IndexName: 'ProjectUser',
        KeyConditionExpression: 'projectId = :pid',
        ExpressionAttributeValues: { ':pid': id }
      })
    );

    const deleteCollabReqs =
      oldCollabs.Items?.map((rel) => ({
        DeleteRequest: {
          Key: { PK: `USER#${rel.userId}`, SK: `PROJECT#${id}` }
        }
      })) || [];

    const insertCollabReqs = collaboratorsId.map((userId) => ({
      PutRequest: {
        Item: {
          PK: `USER#${userId}`,
          SK: `PROJECT#${id}`,
          projectId: id,
          userId
        }
      }
    }));

    const collabReqs = [...deleteCollabReqs, ...insertCollabReqs];
    for (let i = 0; i < collabReqs.length; i += 25) {
      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: collabReqs.slice(i, i + 25)
          }
        })
      );
    }

    return NextResponse.json(
      { message: 'Proyecto actualizado con éxito', projectId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) return ErrorResponse('projectId es requerido', 400);

    const itemsResponse = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `PROJECT#${id}`
        }
      })
    );
    const items = itemsResponse.Items || [];
    if (items.length === 0) {
      return ErrorResponse('Proyecto no encontrado', 404);
    }

    const usersResponse = await ddbDocClient.send(
      new QueryCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        KeyConditionExpression: 'SK = :sk',
        ExpressionAttributeValues: {
          ':sk': `PROJECT#${id}`
        }
      })
    );
    if (usersResponse.Items.length > 0) {
      const userElements = [];
      for (let i = 0; i < usersResponse.Items.length; i += 25) {
        userElements.push(usersResponse.Items.slice(i, i + 25));
      }
      for (const element of elements) {
        const deleteUsersRelations = element.map((item) => ({
          DeleteRequest: {
            Key: { PK: item.PK, SK: item.SK }
          }
        }));

        await ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [environment.DYNAMODB_TABLENAME]: deleteUsersRelations
            }
          })
        );
      }
    }

    const elements = [];
    for (let i = 0; i < items.length; i += 25) {
      elements.push(items.slice(i, i + 25));
    }

    for (const element of elements) {
      const deleteRequests = element.map((item) => ({
        DeleteRequest: {
          Key: { PK: item.PK, SK: item.SK }
        }
      }));

      await ddbDocClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [environment.DYNAMODB_TABLENAME]: deleteRequests
          }
        })
      );
    }

    return NextResponse.json(
      {
        message: 'Proyecto eliminado correctamente',
        deletedItems: items.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}
