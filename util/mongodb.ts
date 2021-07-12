import { MongoClient, Db } from "mongodb";

let DbInstance: Db;

const connectToDb = async () => {
  const client = await MongoClient.connect(`${process.env.DB_URL}`, {
    useUnifiedTopology: true,
  });
  DbInstance = client.db(`${process.env.DB_NAME}`);
};

export const getDbInstance = () => {
  return DbInstance;
};

export default connectToDb;
