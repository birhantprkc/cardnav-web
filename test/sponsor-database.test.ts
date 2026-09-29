/** Public sponsor reads consume display-ready rows from the database view. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import pg from 'pg';
import { getSponsors } from '../src/sponsor-provider.js';
import { getPool } from '../src/store.js';

test('public sponsor view provides localized cards in display order for each list', {
  skip: !process.env.SPONSOR_TEST_DATABASE_URL,
}, async () => {
  const originalUrl = process.env.DATABASE_URL;
  const connectionString = process.env.SPONSOR_TEST_DATABASE_URL!;
  const schema = `sponsor_test_${randomUUID().replaceAll('-', '')}`;
  const db = new pg.Client({ connectionString });
  await db.connect();
  try {
    await db.query(`CREATE SCHEMA ${schema}`);
    await db.query(`SET search_path TO ${schema}`);
    await db.query(`CREATE VIEW public_sponsor_placements AS
      SELECT * FROM (VALUES
        ('full', 2, 'second', '{"default":"Second"}'::jsonb),
        ('full', 1, 'first', '{"default":"First", "zh":"第一"}'::jsonb),
        ('shop', 1, 'shop-card', '{"default":"Shop card"}'::jsonb)
      ) AS cards(list_id, display_order, id, title)
      CROSS JOIN (SELECT '{}'::jsonb AS description, '{"default":"https://example.com"}'::jsonb AS url,
        'default'::text AS template, '[]'::jsonb AS links,
        '{}'::jsonb AS image_options, NULL::text AS image_url) AS details`);
    const url = new URL(connectionString);
    url.searchParams.set('options', `-c search_path=${schema}`);
    process.env.DATABASE_URL = url.toString();
    const sponsors = await getSponsors({ placement: 'page-bottom', pageType: 'about', locale: 'zh' });
    assert.deepEqual(sponsors.map(s => s.id), ['first', 'second']);
    assert.deepEqual(sponsors[0], {
      id: 'first', title: '第一', description: '', url: 'https://example.com', template: 'default', links: [],
      image: { src: '', scaleMode: 'contain', padding: undefined, backgroundColor: undefined, alt: '' },
    });
    assert.deepEqual((await getSponsors({ placement: 'after-hero', pageType: 'shops', locale: 'en' })).map(s => s.id), ['shop-card']);
    assert.deepEqual(await getSponsors({ placement: 'after-hero', pageType: 'gateway', locale: 'zh' }), []);
  } finally {
    if (originalUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalUrl;
    await getPool().end();
    await db.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await db.end();
  }
});
