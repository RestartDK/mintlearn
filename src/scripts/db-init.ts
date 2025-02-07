// scripts/init-db.ts
import { initDb } from "../lib/db";

async function init() {
  try {
    await initDb();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

init();
