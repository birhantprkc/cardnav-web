import type { APIRoute } from 'astro';
import { serveSponsorMedia } from '../../../sponsor-media.js';
export const GET: APIRoute = ({ params, request }) => serveSponsorMedia(params.filename, request.method);
export const HEAD = GET;
