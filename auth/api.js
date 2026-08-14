import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveHostFromManifest(manifest) {
  if (!manifest) {
    return null;
  }

  const hostCandidates = [
    manifest.debuggerHost,
    manifest.packagerOpts?.packagerHost,
    manifest.hostUri,
    manifest.extra?.API_HOST,
    manifest.extra?.apiHost,
    manifest.extra?.API_BASE_URL,
    manifest.extra?.apiBaseUrl,
  ];

  for (const candidate of hostCandidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      const cleaned = candidate.replace(/^https?:\/\//, '').split(':')[0];
      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  }

  return null;
}

function resolvePortFromManifest(manifest) {
  if (!manifest) {
    return null;
  }

  const portCandidates = [
    manifest.extra?.API_PORT,
    manifest.extra?.apiPort,
    manifest.extra?.expoClient?.extra?.API_PORT, // Key path manifest2
  ];

  for (const candidate of portCandidates) {
    if (typeof candidate === 'number') {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function resolveExpoHost() {
  // Check candidates in prioritized order
  const hostCandidates = [
    Constants.expoConfig?.extra?.API_HOST,
    Constants.expoConfig?.extra?.apiHost,
    Constants.expoConfig?.extra?.API_BASE_URL,
    Constants.expoConfig?.extra?.apiBaseUrl,
    Constants.manifest2?.extra?.expoClient?.extra?.API_HOST, // Key path untuk manifest2 / Expo modern
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.expoGoConfig?.debuggerHost,
    Constants.expoGoConfig?.hostUri,
    Constants.hostUri,
    Constants.manifest?.debuggerHost,
    Constants.manifest?.packagerOpts?.packagerHost,
    Constants.manifest?.hostUri,
    Constants.expoConfig?.hostUri,
  ];

  let host = null;
  for (const candidate of hostCandidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      const cleaned = candidate.replace(/^https?:\/\//, '').split(':')[0];
      if (cleaned.length > 0) {
        host = cleaned;
        break;
      }
    }
  }

  const manifest = Constants.manifest || Constants.manifest2 || Constants.expoConfig;
  const port = resolvePortFromManifest(manifest) || Constants.expoGoConfig?.extra?.expoConfig?.extra?.API_PORT;

  return { host, port };
}

const isDevice = Constants.isDevice ?? false;
const { host: resolvedHost, port: resolvedPort } = resolveExpoHost();
// Mendeteksi IP Host PC secara otomatis agar dinamis mengikuti jaringan yang digunakan
const host = resolvedHost || '127.0.0.1';
const port = resolvedPort || 3000;
export const API_BASE_URL = `http://${host}:${port}`;

export async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

if (__DEV__) {
  console.log('[auth/api] FORCED API host to PC Local IP:', host);
  console.log('[auth/api] resolved API port:', port);
  console.log('[auth/api] API_BASE_URL:', API_BASE_URL);
}

if (__DEV__) {
  console.log('[auth/api] resolved API host:', host);
  console.log('[auth/api] API_BASE_URL:', API_BASE_URL);
}
