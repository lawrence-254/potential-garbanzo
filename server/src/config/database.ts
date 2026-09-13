// import prisma from "./prisma";

// export async function connectDatabase() {
//   try {
//     await prisma.$connect();

//     console.log("SQLite database connected");
//   } catch (error) {
//     console.error("SQLite database connection failed:", error);

//     process.exit(1);
//   }
// }

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Adjust this to match the directory your .db file lives in
const dbDir = path.join(__dirname, '../data');   // or './data', etc.
const dbPath = path.join(dbDir, 'app.db');       // change filename if needed

// Create the directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("SQLite connected successfully");

export default db;