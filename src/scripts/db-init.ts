"use server";

import { initDb } from "@/lib/queries";

async function init() {
  try {
    await initDb();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

init();
