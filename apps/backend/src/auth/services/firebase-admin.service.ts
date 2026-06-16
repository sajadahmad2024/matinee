import { EnvConfig } from '@config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FirebaseIdentity {
  uid: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  picture: string | null;
  signInProvider: string | null;
}

/**
 * Thin wrapper over firebase-admin used to verify Firebase ID tokens for both
 * phone (Firebase Phone Auth) and social (Google/Apple via Firebase Auth) login.
 * Lazily initialized from FCM_* credentials.
 */
@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App | null = null;

  constructor(private readonly config: ConfigService<EnvConfig>) {}

  private getApp(): admin.app.App {
    if (this.app) {
      return this.app;
    }
    const projectId = this.config.get<string>('FCM_PROJECT_ID');
    const clientEmail = this.config.get<string>('FCM_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FCM_PRIVATE_KEY')?.replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase credentials (FCM_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY) are not configured');
    }
    this.app =
      admin.apps.length > 0 && admin.apps[0]
        ? admin.apps[0]
        : admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
    return this.app;
  }

  async verifyIdToken(idToken: string): Promise<FirebaseIdentity> {
    const decoded = await this.getApp().auth().verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      phone: (decoded['phone_number'] as string | undefined) ?? null,
      email: decoded.email ?? null,
      name: (decoded['name'] as string | undefined) ?? null,
      picture: decoded.picture ?? null,
      signInProvider: (decoded.firebase?.sign_in_provider as string | undefined) ?? null,
    };
  }
}
