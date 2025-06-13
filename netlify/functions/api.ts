<<<<<<< HEAD
=======

>>>>>>> d033d4d (Assistant checkpoint: Create Netlify function and install dependency)
import express from "express";
import { registerRoutes } from "../../server/routes";
import serverless from "serverless-http";

<<<<<<< HEAD
// Use a promise to wrap the async initialization
let handlerPromise: Promise<any>;

const getHandler = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  await registerRoutes(app); // Await your async route setup

  return serverless(app);
};

// Set up the handlerPromise once
handlerPromise = getHandler();

// Export Netlify-compatible handler
export const handler = async (event: any, context: any) => {
  const handler = await handlerPromise;
  return handler(event, context);
};
=======
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all your API routes
await registerRoutes(app);

// Export the serverless handler
export const handler = serverless(app);
>>>>>>> d033d4d (Assistant checkpoint: Create Netlify function and install dependency)
