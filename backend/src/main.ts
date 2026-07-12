import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Logger as PinoLogger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));

  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api'));

  if (config.get<string>('SWAGGER_ENABLED', 'true') === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TransitOps API')
      .setDescription('Smart Transport Operations Platform — backend API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Health')
      .addTag('Auth')
      .addTag('Users')
      .addTag('Vehicles')
      .addTag('Drivers')
      .addTag('Trips')
      .addTag('Maintenance')
      .addTag('Fuel Logs')
      .addTag('Expenses')
      .addTag('Reports')
      .addTag('Dashboard')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      config.get<string>('SWAGGER_PATH', 'api/docs'),
      app,
      document,
    );
  }

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
}

void bootstrap();
