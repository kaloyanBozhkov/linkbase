import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      ctx: {
        userId: string;
        isPublic?: boolean;
      };
    }
  }
}

export {};
