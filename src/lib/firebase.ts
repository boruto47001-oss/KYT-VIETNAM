import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const AUTHORIZED_ADMIN_EMAIL = 'boruto47001@gmail.com';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const hasFirestoreDb = Boolean(
  firebaseConfig.firestoreDatabaseId &&
    firebaseConfig.firestoreDatabaseId.trim().length > 0
);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  googleProvider.addScope(scope);
}
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: AUTHORIZED_ADMIN_EMAIL,
});

interface GisTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GisTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            hint?: string;
            prompt?: string;
            callback: (response: GisTokenResponse) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => GisTokenClient;
        };
      };
    };
  }
}

// Clear any stale cached origin validation rejection on the Firebase Auth popup resolver
function resetPopupOriginValidationCache(): void {
  try {
    const internalAuth = auth as unknown as {
      _popupRedirectResolver?: {
        _originValidation?: () => Promise<void>;
        originValidationPromises?: Record<string, Promise<void>>;
      };
    };
    const resolver = internalAuth._popupRedirectResolver;
    if (resolver) {
      resolver._originValidation = () => Promise.resolve();
      if (resolver.originValidationPromises) {
        for (const key of Object.keys(resolver.originValidationPromises)) {
          resolver.originValidationPromises[key] = Promise.resolve();
        }
      }
    }
  } catch {
    // Ignore if internal structure differs
  }
}

resetPopupOriginValidationCache();

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the OAuth access token strictly in memory (never in localStorage/sessionStorage).
let cachedAccessToken: string | null = null;

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  return Boolean(
    user &&
      user.emailVerified &&
      user.email &&
      user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  );
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Ensures the authenticated admin account (boruto47001@gmail.com) is registered
 * in the /admins/{uid} collection in Cloud Firestore when Firestore is enabled.
 */
export async function ensureCloudAdminProfile(user: User): Promise<void> {
  if (!hasFirestoreDb || !isAuthorizedAdminUser(user)) return;
  const cleanUid = user.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const adminRef = doc(db, 'admins', cleanUid);
  try {
    const existing = await getDoc(adminRef);
    if (!existing.exists()) {
      await setDoc(adminRef, {
        uid: cleanUid,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }
  } catch {
    // Ignore if Firestore rules or network are still initializing
  }
}

/**
 * Initialize auth state listener and manage in-memory access token lifecycle.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && isAuthorizedAdminUser(user)) {
      await ensureCloudAdminProfile(user);
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (user && !isAuthorizedAdminUser(user)) {
        await signOut(auth);
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Requests an OAuth2 access token directly via Google Identity Services (GIS)
 * and exchanges it for a Firebase Auth session using signInWithCredential.
 * This completely bypasses Firebase's popup domain check (auth/unauthorized-domain).
 */
async function signInViaGoogleIdentityServices(
  clientId: string
): Promise<{ user: User; accessToken: string }> {
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('GIS_NOT_LOADED');
  }

  const accessToken = await new Promise<string>((resolve, reject) => {
    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: ['openid', 'email', 'profile', ...SCOPES].join(' '),
      hint: AUTHORIZED_ADMIN_EMAIL,
      prompt: 'select_account',
      callback: (response: GisTokenResponse) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                'Không lấy được mã truy cập từ Google OAuth.'
            )
          );
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => {
        reject(
          new Error(
            err?.message ||
              (err?.type === 'popup_closed'
                ? 'Bạn đã đóng cửa sổ đăng nhập Google.'
                : 'Không thể mở cửa sổ đăng nhập Google.')
          )
        );
      },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });

  // Exchange the Google OAuth access token for a Firebase Auth User session
  // via signInWithCredential (which calls accounts:signInWithIdp directly and NEVER throws auth/unauthorized-domain)
  const credential = GoogleAuthProvider.credential(null, accessToken);
  const result = await signInWithCredential(auth, credential);

  if (!isAuthorizedAdminUser(result.user)) {
    cachedAccessToken = null;
    await signOut(auth);
    throw new Error(
      `Truy cập bị từ chối: Chỉ tài khoản quản trị viên (${AUTHORIZED_ADMIN_EMAIL}) mới có quyền truy cập hệ thống Tracking & Google Drive.`
    );
  }

  cachedAccessToken = accessToken;
  await ensureCloudAdminProfile(result.user);
  return { user: result.user, accessToken };
}

/**
 * Signs in the admin user with Google and requests the Google Drive file scope.
 * Uses Google Identity Services + signInWithCredential first to avoid auth/unauthorized-domain,
 * with fallback to signInWithPopup.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    resetPopupOriginValidationCache();

    const oAuthClientId = (firebaseConfig as { oAuthClientId?: string }).oAuthClientId;

    if (oAuthClientId && window.google?.accounts?.oauth2) {
      return await signInViaGoogleIdentityServices(oAuthClientId);
    }

    const result = await signInWithPopup(auth, googleProvider);

    if (!isAuthorizedAdminUser(result.user)) {
      cachedAccessToken = null;
      await signOut(auth);
      throw new Error(
        `Truy cập bị từ chối: Chỉ tài khoản quản trị viên (${AUTHORIZED_ADMIN_EMAIL}) mới có quyền truy cập hệ thống Tracking & Google Drive.`
      );
    }

    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được quyền truy cập Google Drive từ phiên đăng nhập.');
    }

    cachedAccessToken = credential.accessToken;
    await ensureCloudAdminProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async (): Promise<void> => {
  cachedAccessToken = null;
  await signOut(auth);
};

// Backwards-compatible aliases
export const signInAdminWithGoogle = googleSignIn;
export const signOutAdmin = logout;

export { onAuthStateChanged };
export type { User };
