import { MongoClient, Db } from "mongodb";

let DbInstance: Db;

const connectToDb = async () => {
  try {
    const client = await MongoClient.connect(`${process.env.DB_URL}`, {
      useUnifiedTopology: true,
    });
    DbInstance = client.db(`${process.env.DB_NAME}`);
  } catch (err) {
    throw new Error("Error when connect to DB");
  }
};

export const getDbInstance = () => {
  return DbInstance;
};

export default connectToDb;
