import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DEALERS_JSON_PATH = path.join(DATA_DIR, 'dealer-applications.json');
const DEALERS_CSV_PATH = path.join(DATA_DIR, 'dealer-applications.csv');
const TRACKING_JSON_PATH = path.join(DATA_DIR, 'tracking-events.json');
const CONFIG_JSON_PATH = path.join(DATA_DIR, 'tracking-config.json');

// 30-Day (1 Month) Rolling Retention Window for Tracking History
const RETENTION_30_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SERVER_EVENTS = 50000;

export interface ServerDealerRecord {
  id: string;
  applicationId: string;
  timestamp: number;
  createdAtIso: string;
  storeName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  interestedLines: string[];
  businessScale: string;
  notes: string;
  lang: 'VIE' | 'ENG';
}

export interface ServerTrackingEvent {
  id: string;
  eventId: string;
  timestamp: number;
  timestampIso: string;
  type: string;
  eventType: string;
  targetId: string;
  targetLabel: string;
  category: string;
  meta?: Record<string, string | number | boolean>;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  lang: 'VIE' | 'ENG';
  sessionId: string;
}

export interface ServerTrackingConfig {
  ga4MeasurementId: string;
  gtmContainerId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  enableAutoTracking: 'true' | 'false' | boolean;
}

const DEFAULT_CONFIG: ServerTrackingConfig = {
  ga4MeasurementId: '',
  gtmContainerId: '',
  metaPixelId: '',
  tiktokPixelId: '',
  enableAutoTracking: 'true',
};

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function escapeCsvCell(val: string | number | boolean | undefined | null): string {
  const str = val === undefined || val === null ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildDealerApplicationsCsv(records: ServerDealerRecord[]): string {
  const headers = [
    'Application_ID',
    'Submitted_At_ISO',
    'Submitted_Time_VN',
    'Store_Name',
    'Contact_Name',
    'Phone_Number',
    'Email',
    'City_Province',
    'Address',
    'Business_Scale',
    'Interested_Product_Lines',
    'Notes',
    'Language',
  ];

  const rows = records.map((r) => [
    escapeCsvCell(r.applicationId || r.id),
    escapeCsvCell(r.createdAtIso),
    escapeCsvCell(new Date(r.timestamp).toLocaleString('vi-VN')),
    escapeCsvCell(r.storeName),
    escapeCsvCell(r.contactName),
    escapeCsvCell(r.phone),
    escapeCsvCell(r.email),
    escapeCsvCell(r.city),
    escapeCsvCell(r.address),
    escapeCsvCell(r.businessScale),
    escapeCsvCell(Array.isArray(r.interestedLines) ? r.interestedLines.join(' | ') : ''),
    escapeCsvCell(r.notes),
    escapeCsvCell(r.lang),
  ]);

  return '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

function readDealersFromDisk(): ServerDealerRecord[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(DEALERS_JSON_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(DEALERS_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeDealerRecord(item))
      .filter((r): r is ServerDealerRecord => r !== null);
  } catch (err) {
    console.error('[Server Storage] Failed to read dealer-applications.json:', err);
    return [];
  }
}

function writeDealersToDisk(records: ServerDealerRecord[]): void {
  ensureDataDir();
  try {
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    fs.writeFileSync(DEALERS_JSON_PATH, JSON.stringify(sorted, null, 2), 'utf-8');
    const csvContent = buildDealerApplicationsCsv(sorted);
    fs.writeFileSync(DEALERS_CSV_PATH, csvContent, 'utf-8');
  } catch (err) {
    console.error('[Server Storage] Failed to write dealer applications to disk:', err);
  }
}

function filterEventsWithin30Days(events: ServerTrackingEvent[]): ServerTrackingEvent[] {
  const cutoff = Date.now() - RETENTION_30_DAYS_MS;
  return events.filter((ev) => ev.timestamp >= cutoff);
}

function readTrackingEventsFromDisk(): ServerTrackingEvent[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(TRACKING_JSON_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(TRACKING_JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map((item) => normalizeTrackingEvent(item))
      .filter((ev): ev is ServerTrackingEvent => ev !== null);
    return filterEventsWithin30Days(normalized);
  } catch (err) {
    console.error('[Server Storage] Failed to read tracking-events.json:', err);
    return [];
  }
}

function writeTrackingEventsToDisk(events: ServerTrackingEvent[]): void {
  ensureDataDir();
  try {
    const within30Days = filterEventsWithin30Days(events);
    const sorted = [...within30Days]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_SERVER_EVENTS);
    fs.writeFileSync(TRACKING_JSON_PATH, JSON.stringify(sorted, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server Storage] Failed to write tracking-events.json:', err);
  }
}

function readConfigFromDisk(): ServerTrackingConfig {
  ensureDataDir();
  try {
    if (!fs.existsSync(CONFIG_JSON_PATH)) {
      return DEFAULT_CONFIG;
    }
    const raw = fs.readFileSync(CONFIG_JSON_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function writeConfigToDisk(config: ServerTrackingConfig): void {
  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_JSON_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server Storage] Failed to write tracking-config.json:', err);
  }
}

function normalizeDealerRecord(input: Partial<ServerDealerRecord>): ServerDealerRecord | null {
  const storeName = String(input.storeName ?? '').trim();
  const contactName = String(input.contactName ?? '').trim();
  const phone = String(input.phone ?? '').trim();
  const city = String(input.city ?? '').trim();

  if (!storeName || !contactName || !phone || !city) {
    return null;
  }

  const timestamp =
    typeof input.timestamp === 'number' && Number.isFinite(input.timestamp)
      ? input.timestamp
      : typeof input.createdAtIso === 'string' && !Number.isNaN(Date.parse(input.createdAtIso))
        ? Date.parse(input.createdAtIso)
        : Date.now();

  const rawId = String(input.applicationId || input.id || '').trim();
  const id =
    rawId.length > 0 ? rawId : `dealer_${timestamp}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    applicationId: id,
    timestamp,
    createdAtIso:
      typeof input.createdAtIso === 'string' && input.createdAtIso.trim().length > 0
        ? input.createdAtIso
        : new Date(timestamp).toISOString(),
    storeName: storeName.slice(0, 200),
    contactName: contactName.slice(0, 160),
    phone: phone.slice(0, 64),
    email: String(input.email || 'N/A').trim().slice(0, 160),
    city: city.slice(0, 120),
    address: String(input.address || 'N/A').trim().slice(0, 300),
    interestedLines: Array.isArray(input.interestedLines)
      ? input.interestedLines.map((x) => String(x))
      : [],
    businessScale: String(input.businessScale || 'Showroom / Cửa hàng chuyên doanh')
      .trim()
      .slice(0, 160),
    notes: String(input.notes ?? '').trim().slice(0, 1000),
    lang: input.lang === 'ENG' ? 'ENG' : 'VIE',
  };
}

function normalizeTrackingEvent(input: Partial<ServerTrackingEvent>): ServerTrackingEvent | null {
  const type = String(input.eventType || input.type || '').trim();
  const targetId = String(input.targetId ?? '').trim();
  const targetLabel = String(input.targetLabel ?? '').trim();

  if (!type || !targetId || !targetLabel) {
    return null;
  }

  const timestamp =
    typeof input.timestamp === 'number' && Number.isFinite(input.timestamp)
      ? input.timestamp
      : typeof input.timestampIso === 'string' && !Number.isNaN(Date.parse(input.timestampIso))
        ? Date.parse(input.timestampIso)
        : Date.now();

  const rawId = String(input.eventId || input.id || '').trim();
  const id =
    rawId.length > 0 ? rawId : `evt_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;

  const timestampIso =
    typeof input.timestampIso === 'string' && input.timestampIso.trim().length > 0
      ? input.timestampIso
      : new Date(timestamp).toISOString();

  return {
    id,
    eventId: id,
    timestamp,
    timestampIso,
    type,
    eventType: type,
    targetId: targetId.slice(0, 128),
    targetLabel: targetLabel.slice(0, 200),
    category: input.category ? String(input.category).slice(0, 120) : 'general',
    meta: input.meta && typeof input.meta === 'object' ? input.meta : undefined,
    deviceType:
      input.deviceType === 'mobile' || input.deviceType === 'tablet'
        ? input.deviceType
        : 'desktop',
    lang: input.lang === 'ENG' ? 'ENG' : 'VIE',
    sessionId:
      typeof input.sessionId === 'string' && input.sessionId.trim().length > 0
        ? input.sessionId.trim().slice(0, 128)
        : 'sess_anonymous',
  };
}

async function startServer() {
  ensureDataDir();
  const bootDealers = readDealersFromDisk();
  if (!fs.existsSync(DEALERS_CSV_PATH)) {
    writeDealersToDisk(bootDealers);
  }

  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    const dealers = readDealersFromDisk();
    const events = readTrackingEventsFromDisk();
    const csvExists = fs.existsSync(DEALERS_CSV_PATH);
    res.json({
      ok: true,
      timestamp: Date.now(),
      retentionDays: 30,
      storageDir: DATA_DIR,
      csvReady: csvExists,
      counts: {
        dealers: dealers.length,
        events: events.length,
      },
    });
  });

  app.get('/api/dealers', (_req, res) => {
    const records = readDealersFromDisk();
    res.json({
      ok: true,
      records,
      total: records.length,
      csvReady: fs.existsSync(DEALERS_CSV_PATH),
    });
  });

  app.get('/api/dealers/csv', (_req, res) => {
    const records = readDealersFromDisk();
    const csvContent = buildDealerApplicationsCsv(records);
    writeDealersToDisk(records);
    const dateStamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kyt-vietnam-danh-sach-dang-ky-dai-ly-${dateStamp}.csv"`
    );
    res.send(csvContent);
  });

  app.post('/api/dealers', (req, res) => {
    const existing = readDealersFromDisk();
    const byId = new Map<string, ServerDealerRecord>();
    for (const r of existing) {
      byId.set(r.applicationId || r.id, r);
    }

    const incomingBatch: unknown[] = Array.isArray(req.body?.records)
      ? req.body.records
      : [req.body];

    let savedRecord: ServerDealerRecord | null = null;
    let addedCount = 0;

    for (const rawItem of incomingBatch) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const normalized = normalizeDealerRecord(rawItem as Partial<ServerDealerRecord>);
      if (!normalized) continue;
      if (!byId.has(normalized.applicationId)) {
        addedCount += 1;
      }
      byId.set(normalized.applicationId, normalized);
      savedRecord = normalized;
    }

    if (!savedRecord && incomingBatch.length === 1) {
      res.status(400).json({
        ok: false,
        error: 'Missing required dealer fields (storeName, contactName, phone, city).',
      });
      return;
    }

    const merged = Array.from(byId.values()).sort((a, b) => b.timestamp - a.timestamp);
    writeDealersToDisk(merged);

    res.json({
      ok: true,
      addedCount,
      record: savedRecord,
      records: merged,
      total: merged.length,
    });
  });

  app.delete('/api/dealers', (req, res) => {
    const targetId = typeof req.query.id === 'string' ? req.query.id.trim() : '';
    if (targetId) {
      const existing = readDealersFromDisk();
      const filtered = existing.filter((r) => r.id !== targetId && r.applicationId !== targetId);
      writeDealersToDisk(filtered);
      res.json({ ok: true, deletedId: targetId, total: filtered.length, records: filtered });
      return;
    }
    writeDealersToDisk([]);
    res.json({ ok: true, clearedAll: true, total: 0, records: [] });
  });

  app.get('/api/tracking', (_req, res) => {
    const events = readTrackingEventsFromDisk();
    const config = readConfigFromDisk();
    res.json({
      ok: true,
      retentionDays: 30,
      events,
      total: events.length,
      config,
    });
  });

  app.post('/api/tracking', (req, res) => {
    const existing = readTrackingEventsFromDisk();
    const byId = new Map<string, ServerTrackingEvent>();
    for (const ev of existing) {
      byId.set(ev.eventId || ev.id, ev);
    }

    const incomingBatch: unknown[] = Array.isArray(req.body?.events)
      ? req.body.events
      : [req.body];

    const cutoff = Date.now() - RETENTION_30_DAYS_MS;
    let savedEvent: ServerTrackingEvent | null = null;
    let addedCount = 0;

    for (const rawItem of incomingBatch) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const normalized = normalizeTrackingEvent(rawItem as Partial<ServerTrackingEvent>);
      if (!normalized) continue;
      if (normalized.timestamp < cutoff) continue;
      if (!byId.has(normalized.eventId)) {
        addedCount += 1;
      }
      byId.set(normalized.eventId, normalized);
      savedEvent = normalized;
    }

    const merged = Array.from(byId.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_SERVER_EVENTS);

    writeTrackingEventsToDisk(merged);

    res.json({
      ok: true,
      addedCount,
      event: savedEvent,
      total: merged.length,
    });
  });

  app.delete('/api/tracking', (req, res) => {
    const targetId = typeof req.query.id === 'string' ? req.query.id.trim() : '';
    const targetSessionId =
      typeof req.query.sessionId === 'string' ? req.query.sessionId.trim() : '';

    if (targetId) {
      const existing = readTrackingEventsFromDisk();
      const filtered = existing.filter((ev) => ev.id !== targetId && ev.eventId !== targetId);
      writeTrackingEventsToDisk(filtered);
      res.json({ ok: true, deletedId: targetId, total: filtered.length });
      return;
    }

    if (targetSessionId) {
      const existing = readTrackingEventsFromDisk();
      const filtered = existing.filter((ev) => ev.sessionId !== targetSessionId);
      writeTrackingEventsToDisk(filtered);
      res.json({
        ok: true,
        purgedSessionId: targetSessionId,
        removedCount: existing.length - filtered.length,
        total: filtered.length,
      });
      return;
    }

    writeTrackingEventsToDisk([]);
    res.json({ ok: true, clearedAll: true, total: 0 });
  });

  app.get('/api/tracking/config', (_req, res) => {
    res.json({ ok: true, config: readConfigFromDisk() });
  });

  app.post('/api/tracking/config', (req, res) => {
    const current = readConfigFromDisk();
    const nextConfig: ServerTrackingConfig = {
      ga4MeasurementId: String(req.body?.ga4MeasurementId ?? current.ga4MeasurementId)
        .trim()
        .slice(0, 64),
      gtmContainerId: String(req.body?.gtmContainerId ?? current.gtmContainerId)
        .trim()
        .slice(0, 64),
      metaPixelId: String(req.body?.metaPixelId ?? current.metaPixelId).trim().slice(0, 64),
      tiktokPixelId: String(req.body?.tiktokPixelId ?? current.tiktokPixelId)
        .trim()
        .slice(0, 64),
      enableAutoTracking:
        req.body?.enableAutoTracking === 'false' || req.body?.enableAutoTracking === false
          ? 'false'
          : 'true',
    };
    writeConfigToDisk(nextConfig);
    res.json({ ok: true, config: nextConfig });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KYT Vietnam Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
