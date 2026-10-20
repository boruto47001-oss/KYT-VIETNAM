import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
    // Ignore if Firestore is not active on this OAuth project
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
 * Signs in the admin user with Google and requests the Google Drive file scope.
 * Must be called from a user button click.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
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
