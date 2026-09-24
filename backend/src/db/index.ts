import "dotenv/config";
import {drizzle} from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";


const pool = new pg.Pool({connectionString: process.env.Database_url})

export const db = drizzle(pool,{schema})

