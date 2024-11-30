import { FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyReply {
    setHeader(key: string, value: string): void;
    end(): void;
  }

  interface FastifyRequest {
    res?: FastifyReply;
  }
}
