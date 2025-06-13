import express from "express";
import { registerRoutes } from "../../server/routes";
import serverless from "serverless-http";

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