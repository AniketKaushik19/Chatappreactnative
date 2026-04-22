import "dotenv/config"; 

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../prisma/generated/prisma/client/index.js"; 

// 1. Import the adapter (this example uses PostgreSQL)
import { PrismaPg } from "@prisma/adapter-pg";
import {expo} from "@better-auth/expo"
// 2. Initialize the adapter with your environment variable
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

// 3. Pass the adapter to PrismaClient! 
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
    plugins:[expo()],
    database: prismaAdapter(prisma, {
        provider: "postgresql", // Ensure this matches your DB
    }),
    emailAndPassword:{
        enabled:true
    },
    // ... the rest of your configuration
    trustedOrigins:[
        "chatapp://",
        ...(process.env!=="production")?
        [
             "exp://",                      // Trust all Expo URLs (prefix matching)
            "exp://**",                    // Trust all Expo URLs (wildcard matching)
            "exp://192.168.*.*:*/**",  
        ]:[]
    ],
    debug:process.env.NODE_ENV!=="production",
    allowDangerousConnections:process.env.NODE_ENV!=="production"
});