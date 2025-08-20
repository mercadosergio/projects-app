export const environment = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  AWS_REGION: process.env.AWS3_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS3_ACCESS_KEY_ID,
  AWS_SECRET_KEY: process.env.AWS3_SECRET_KEY,
  DYNAMODB_TABLENAME: process.env.DYNAMODB_TABLENAME,
  NOTIFY_LAMBDA: process.env.NOTIFY_LAMBDA
};
