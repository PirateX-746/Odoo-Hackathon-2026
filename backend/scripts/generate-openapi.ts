// Boots the app from the compiled dist/ output (not raw TS via tsx) — tsx's
// esbuild transform doesn't implement emitDecoratorMetadata, which silently
// breaks NestJS constructor injection for implicit-type parameters (e.g.
// PrismaService's `config: ConfigService`). Requires `npm run build` first.
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../dist/app.module');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildOpenApiDocument } = require('../dist/config/swagger.config');

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = buildOpenApiDocument(app);

  const outDir = join(__dirname, '..', 'docs');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));

  await app.close();
  console.log(`OpenAPI spec written to ${outPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
