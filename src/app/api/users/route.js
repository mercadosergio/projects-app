import { environment } from '@/config/environment';
import { ErrorResponse } from '@/lib/middlewares/api-responses';
import { ddbDocClient } from '@/services/aws/bdconfig';
import { getInitials } from '@/utils/get-initials';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function GET() {
  try {
    const response = await ddbDocClient.send(
      new ScanCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        FilterExpression: 'begins_with(PK, :pk) AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': 'USER#',
          ':sk': 'METADATA#'
        }
      })
    );

    const users =
      response.Items.map((user) => {
        const id = user.PK.split('#')[1];
        delete user.password;
        return { ...user, id };
      }) || [];

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message);
  }
}

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    const userId = uuid();
    const now = new Date().toISOString();

    const hashedPassword = await hash(password, 10);
    const avatar = getInitials(name);

    await ddbDocClient.send(
      new PutCommand({
        TableName: environment.DYNAMODB_TABLENAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `METADATA#${userId}`,
          name,
          avatar,
          email,
          password: hashedPassword,
          createdAt: now
        }
      })
    );

    return NextResponse.json(
      {
        message: 'Usuario registrado con éxito',
        projectId: userId
      },
      { status: 201 }
    );
  } catch (error) {
    return ErrorResponse(error.message);
  }
}
