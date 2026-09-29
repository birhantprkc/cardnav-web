import type { APIRoute } from 'astro';
import { recordGatewayEngagement } from '../../store.js';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (typeof body.subjectId !== 'string' || typeof body.visitorId !== 'string'
    || !['site', 'model'].includes(String(body.subjectType))
    || !['detail', 'open'].includes(String(body.eventType))) return new Response(null, { status: 400 });
  const result = await recordGatewayEngagement(body as Parameters<typeof recordGatewayEngagement>[0]);
  return new Response(null, { status: result.recorded ? 202 : 204, headers: { 'cache-control': 'no-store' } });
};
