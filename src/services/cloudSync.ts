/**
 * Cloud Synchronization Service
 * Enables live multi-device real-time sync when deployed to Vercel, GitHub, or any domain.
 * Automatically persists to local storage and syncs with cloud repository.
 */

export interface CloudPayload {
  version: number;
  timestamp: number;
  lastUpdatedBy: string;
  allUsers: any[];
  allEmployees: any[];
  attendanceRecords: any[];
  kpiRecords: any[];
  salaryRecords: any[];
  deductions: any[];
  payslips: any[];
  policy: any;
  notifications: any[];
  auditLogs: any[];
  departments: any[];
  designations: any[];
  companyTasks: any[];
}

const CLOUD_SYNC_URL = 'https://kv.val.run/rhinomds_rcm_live_production_v1';
const BROADCAST_CHANNEL_NAME = 'rhinomds_live_portal_sync';

// BroadcastChannel for cross-tab real-time communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  // BroadcastChannel not available in environment
}

export function subscribeToLocalTabSync(callback: (payload: CloudPayload) => void) {
  if (!broadcastChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SYNC_STATE' && event.data.payload) {
      callback(event.data.payload);
    }
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

export function broadcastStateChange(payload: CloudPayload) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_STATE', payload });
    }
  } catch (e) {
    console.warn('BroadcastChannel sync notice:', e);
  }
}

/**
 * Fetch latest database state from cloud
 */
export async function fetchCloudState(): Promise<CloudPayload | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(CLOUD_SYNC_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.allEmployees && Array.isArray(data.allEmployees)) {
        return data as CloudPayload;
      }
    }
  } catch (error) {
    // Cloud fetch non-blocking fallback
    // console.log('Cloud sync fallback to local cache:', error);
  }
  return null;
}

/**
 * Push updated database state to cloud
 */
export async function pushCloudState(payload: CloudPayload): Promise<boolean> {
  // Always notify local tabs immediately
  broadcastStateChange(payload);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(CLOUD_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    // Non-blocking catch
    return false;
  }
}
