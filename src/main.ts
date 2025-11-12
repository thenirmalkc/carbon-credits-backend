import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const PORT = +(process.env.PORT! || 3000);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('main/api/v1');

  if (['local', 'dev', 'test'].includes(process.env.ENV!)) {
    const config = new DocumentBuilder()
      .setTitle('Carbon credit')
      .setDescription('List of apis for Carbon credit')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('main/api/v1/docs', app, documentFactory);
  }

  await app.listen(PORT);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Docs: http://localhost:${PORT}/main/api/v1/docs`);
}
bootstrap().catch((err: Error) => {
  console.log(`[name]: ${err.name} [message]: ${err.message}`);
});
