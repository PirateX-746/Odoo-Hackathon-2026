import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
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
    .addTag('Insights')
    .addTag('Dispatch Assistant')
    .build();

  return SwaggerModule.createDocument(app, config);
}
