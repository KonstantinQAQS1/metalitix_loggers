import { API_ORIGIN, API_URL } from '../constants';
import { XRAnalytics, DataStreamCredentials, MetricSurveysData } from '../types';

export async function getXRAnalyticsDataStream(appkey: string, sessionId?: string): Promise<DataStreamCredentials> {
  const response = await fetch(`${API_URL}/data-stream/xr-analytics`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appkey, sessionId }),
  });

  return response.json();
}

export async function sendXRAnalyticsData(data: XRAnalytics.Record | XRAnalytics.BatchRecord) {
  console.log('poll', data);

  return fetch(`${API_URL}/xr-analytics`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function sendMetricSurveysData(data: MetricSurveysData) {
  console.log('survey data', data);

  return fetch(`${API_ORIGIN}/api/v1/metric-surveys`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
