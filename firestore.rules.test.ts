/**
 * Firestore Security Rules Verification Suite for KYT Vietnam Tracking System
 * Verifies that all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  auth: {
    uid: string;
    email: string;
    email_verified: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on tracking_events',
    collection: 'tracking_events',
    docId: 'evt_valid_001',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      eventId: 'evt_valid_001',
      ownerId: 'user_1',
      eventType: 'page_view',
      targetId: 'home',
      targetLabel: 'Homepage',
      category: 'navigation',
      deviceType: 'desktop',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: 'SERVER_TIMESTAMP',
      isVerified: true, // Shadow field
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on tracking_events',
    collection: 'tracking_events',
    docId: 'evt_valid_002',
    operation: 'create',
    auth: { uid: 'attacker_1', email: 'attacker@example.com', email_verified: true },
    payload: {
      eventId: 'evt_valid_002',
      ownerId: 'victim_999',
      eventType: 'page_view',
      targetId: 'home',
      targetLabel: 'Homepage',
      category: 'navigation',
      deviceType: 'desktop',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof',
    collection: 'tracking_configs',
    docId: 'default_config',
    operation: 'get',
    auth: { uid: 'spoof_admin', email: 'boruto47001@gmail.com', email_verified: false },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Resource Poisoning / Oversized String in targetLabel',
    collection: 'tracking_events',
    docId: 'evt_valid_004',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      eventId: 'evt_valid_004',
      ownerId: 'user_1',
      eventType: 'store_directions_click',
      targetId: 'tai-dat-store-q5',
      targetLabel: 'X'.repeat(500), // Exceeds 200 char limit
      category: 'TP. Hồ Chí Minh',
      deviceType: 'mobile',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'ID Poisoning Attack with special characters',
    collection: 'tracking_events',
    docId: 'invalid$id!@#',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      eventId: 'invalid$id!@#',
      ownerId: 'user_1',
      eventType: 'page_view',
      targetId: 'home',
      targetLabel: 'Homepage',
      category: 'navigation',
      deviceType: 'desktop',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Timestamp Forgery on create',
    collection: 'tracking_events',
    docId: 'evt_valid_006',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      eventId: 'evt_valid_006',
      ownerId: 'user_1',
      eventType: 'page_view',
      targetId: 'home',
      targetLabel: 'Homepage',
      category: 'navigation',
      deviceType: 'desktop',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immutable Field Mutation on tracking_configs update',
    collection: 'tracking_configs',
    docId: 'global',
    operation: 'update',
    auth: { uid: 'admin_1', email: 'boruto47001@gmail.com', email_verified: true },
    payload: {
      configId: 'global',
      ownerId: 'different_owner_uid', // Immutable breach
      ga4MeasurementId: 'G-12345678',
      gtmContainerId: '',
      metaPixelId: '',
      tiktokPixelId: '',
      enableAutoTracking: 'true',
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid Enum Value in eventType',
    collection: 'tracking_events',
    docId: 'evt_valid_008',
    operation: 'create',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      eventId: 'evt_valid_008',
      ownerId: 'user_1',
      eventType: 'arbitrary_injected_event',
      targetId: 'home',
      targetLabel: 'Homepage',
      category: 'navigation',
      deviceType: 'desktop',
      lang: 'VIE',
      sessionId: 'sess_123',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unauthorized Self-Promotion to Admin',
    collection: 'admins',
    docId: 'attacker_1',
    operation: 'create',
    auth: { uid: 'attacker_1', email: 'attacker@example.com', email_verified: true },
    payload: {
      uid: 'attacker_1',
      role: 'admin',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Value Poisoning on tracking_configs update',
    collection: 'tracking_configs',
    docId: 'global',
    operation: 'update',
    auth: { uid: 'admin_1', email: 'boruto47001@gmail.com', email_verified: true },
    payload: {
      configId: 'global',
      ownerId: 'admin_1',
      ga4MeasurementId: 'G-' + 'A'.repeat(200), // Exceeds 64 char max
      gtmContainerId: '',
      metaPixelId: '',
      tiktokPixelId: '',
      enableAutoTracking: 'true',
      createdAt: 'ORIGINAL_CREATED_AT',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Unauthorized Cross-User List Scrape',
    collection: 'tracking_events',
    docId: '*',
    operation: 'list',
    auth: { uid: 'attacker_1', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Direct Mutation of Immutable Tracking Event',
    collection: 'tracking_events',
    docId: 'evt_valid_001',
    operation: 'update',
    auth: { uid: 'user_1', email: 'user1@example.com', email_verified: true },
    payload: {
      targetLabel: 'Tampered Label',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
