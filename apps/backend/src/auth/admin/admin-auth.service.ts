import { EnvConfig } from '@config/env.config';
import { DBService } from '@db/db.service';
import { CacheService } from '@cache/cache.service';
import { HashingService } from '@common/hashing/hashing.service';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { RbacRepository } from '@db/repositories/auth/rbac.repository';
import { IdentityRepository } from '@db/repositories/auth/identity.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { ForbiddenException, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, randomUUID } from 'crypto';
import { Platform } from '../interfaces/jwt-payload.interface';
import { TokenPair } from '../interfaces/token.interface';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';
import { toUserDto, UserDto } from '../mappers/user.mapper';

const RESET_OTP_TTL_SECONDS = 10 * 60;
const RESET_COOLDOWN_SECONDS = 45;

export interface AdminLoginResult {
  user: UserDto;
  tokens: TokenPair;
  refreshTtl: number;
}

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly logger = new Logger(AdminAuthService.name);
  /** A valid bcrypt hash used to keep the not-found login path constant-time. */
  private dummyHash = '';

  constructor(
    private readonly db: DBService,
    private readonly cache: CacheService,
    private readonly users: UsersRepository,
    private readonly rbac: RbacRepository,
    private readonly identity: IdentityRepository,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
    private readonly session: SessionService,
    private readonly queue: QueueService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hashing.hash(randomUUID());
  }

  private refreshTtl(rememberMe: boolean): number {
    return rememberMe
      ? this.config.get<number>('JWT_REMEMBER_TTL') ?? 2592000
      : this.config.get<number>('JWT_ADMIN_REFRESH_TTL') ?? 43200;
  }

  async login(email: string, password: string, rememberMe: boolean, platform: Platform): Promise<AdminLoginResult> {
    const user = await this.users.findByEmail(email);
    if (!user || user.accountType !== 'admin' || !user.passwordHash) {
      // Constant-time: always run a bcrypt compare so timing can't enumerate admin emails.
      await this.hashing.compare(password, this.dummyHash);
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await this.hashing.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'active') {
      throw new ForbiddenException('Admin account is not active');
    }
    await this.users.touchLastLogin(user.id);
    const resolved = await this.rbac.resolveForUser(user.id);
    const refreshTtl = this.refreshTtl(rememberMe);
    const tokens = this.tokens.buildPair(
      {
        sub: user.id,
        act: 'admin',
        plt: platform,
        tv: user.tokenVersion,
        status: user.status,
        roles: resolved.roles,
        permissions: resolved.permissions,
      },
      refreshTtl,
    );
    return { user: toUserDto(user, resolved.roles, resolved.permissions), tokens, refreshTtl };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user || user.accountType !== 'admin') {
      // No account enumeration — behave identically, and don't consume the cooldown slot.
      return;
    }
    // Per-email cooldown to prevent email bombing; silent (no 429) to avoid enumeration.
    const cooldownKey = `otp:cooldown:email:${email.toLowerCase()}`;
    if (await this.cache.get<number>(cooldownKey)) {
      return;
    }
    await this.cache.set(cooldownKey, 1, RESET_COOLDOWN_SECONDS);

    const code = randomInt(100000, 1000000).toString();
    const codeHash = await this.hashing.hash(code);
    await this.identity.createOtp({
      userId: user.id,
      destination: email,
      channel: 'email',
      purpose: 'password_reset',
      codeHash,
      expiresInSeconds: RESET_OTP_TTL_SECONDS,
    });
    await this.queue.send(QueueName.EMAIL, JobName.OTP_EMAIL, {
      email,
      otp: Number(code),
      customerName: user.firstName ?? 'Admin',
    });
    this.logger.debug(`Password reset code queued for ${email}`);
  }

  async resetPassword(email: string, code: string, newPassword: string, platform: Platform): Promise<AdminLoginResult> {
    const otp = await this.identity.findActiveOtp(email, 'password_reset');
    if (!otp) {
      throw new UnauthorizedException('Reset code expired or not requested');
    }
    if (otp.attempts >= otp.maxAttempts) {
      throw new UnauthorizedException('Too many attempts; request a new code');
    }
    const ok = await this.hashing.compare(code, otp.codeHash);
    if (!ok) {
      await this.identity.incrementOtpAttempts(otp.id);
      throw new UnauthorizedException('Invalid reset code');
    }
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }
    const passwordHash = await this.hashing.hash(newPassword);
    // Atomic: consume the OTP and set the new password together (setPassword bumps token_version).
    await this.db.transaction(async (tx) => {
      await this.identity.consumeOtp(otp.id, tx);
      await this.users.setPassword(user.id, passwordHash, tx);
    });

    const fresh = await this.users.findById(user.id);
    const resolved = await this.rbac.resolveForUser(user.id);
    const refreshTtl = this.refreshTtl(false);
    const tokens = this.tokens.buildPair(
      {
        sub: user.id,
        act: 'admin',
        plt: platform,
        tv: fresh!.tokenVersion,
        status: fresh!.status,
        roles: resolved.roles,
        permissions: resolved.permissions,
      },
      refreshTtl,
    );
    return { user: toUserDto(fresh!, resolved.roles, resolved.permissions), tokens, refreshTtl };
  }

  async refresh(refreshToken: string, platform: Platform): Promise<{ accessToken: string }> {
    // The single DB read for admin refresh: re-checks token_version + status, re-issues.
    const { accessToken } = await this.session.refresh(refreshToken, platform);
    return { accessToken };
  }

  async getProfile(adminId: string): Promise<UserDto> {
    const user = await this.users.findById(adminId);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }
    const resolved = await this.rbac.resolveForUser(adminId);
    return toUserDto(user, resolved.roles, resolved.permissions);
  }
}
