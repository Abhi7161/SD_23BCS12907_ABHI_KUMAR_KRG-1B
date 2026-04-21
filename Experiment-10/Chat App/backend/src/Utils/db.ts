import mongoose from "mongoose";
import { Pool } from "pg";
const pool=new Pool(
    {
        connectionString: process.env.POSTGRE_SQL_URL,
    }
);
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("Database Connected");
    const client=await pool.connect();
    console.log("PostgreSQL connected sucessfully.");
  } catch (error) {
    console.log("Database Error:", error);
    process.exit(1);
  }
}

export default connectDB;