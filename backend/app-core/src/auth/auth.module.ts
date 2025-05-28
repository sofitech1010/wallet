import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategy/local.strategy';
import { SessionSerializer } from './strategy/session.serializer';
import { HashService } from '../user/hash.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { EmailService } from '../user/email.service';
import { TwoFactorAuthModule } from '../two-factor/verification.module'; 
@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TwoFactorAuthModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    HashService,
    UserService,
    EmailService,
  ],
})
export class AuthModule {}
