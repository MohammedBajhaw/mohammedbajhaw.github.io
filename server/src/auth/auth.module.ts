import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import type { EnvConfig } from '@/common/config/env.validation';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { RevokedToken, RevokedTokenSchema } from './revoked-token.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RevokedToken.name, schema: RevokedTokenSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => {
        const expiresIn = config.get<string>('JWT_EXPIRES_IN', { infer: true });
        return {
          secret: config.get<string>('JWT_SECRET', { infer: true }),
          signOptions: {
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard],
  exports: [AuthService, AdminAuthGuard, JwtModule],
})
export class AuthModule {}
