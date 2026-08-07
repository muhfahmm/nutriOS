import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getExpoHost() {
  const manifest = Constants.manifest || Constants.manifest2 || Constants.expoConfig;
  if (!manifest) return null;

  const hostFromDebugger = manifest.debuggerHost || manifest.packagerOpts?.packagerHost;
  if (typeof hostFromDebugger === 'string') {
    return hostFromDebugger.split(':')[0];
  }

  const extraApiUrl = manifest.extra?.API_BASE_URL;
  if (typeof extraApiUrl === 'string') {
    return extraApiUrl;
  }

  return null;
}

function getDevServerHost() {
  const expoHost = getExpoHost();
  if (expoHost) {
    return expoHost;
  }

  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return '127.0.0.1';
}

const host = getDevServerHost();
export const API_BASE_URL = host.startsWith('http') ? host : `http://${host}:3000`;

export async function postRequest(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}
