/**
 * 文件说明: 验证 Gateway 价格展示保留原始币种与计费单位。
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayPriceUnit } from '../src/gateway-display.js';
import pg from 'pg';
import { loadGatewayDetail, loadGatewayModelDetail } from '../src/store.js';

test('labels currency-specific token and media rates without assuming dollars', () => {
  assert.equal(displayPriceUnit('1M_tokens', 'CNY'), 'CNY / 1M tokens');
  assert.equal(displayPriceUnit('1M_tokens', 'USD'), 'USD / 1M tokens');
  assert.equal(displayPriceUnit('second (video: 720p)', 'CNY'), 'CNY / second (video: 720p)');
  assert.equal(displayPriceUnit('quota_ratio'), '$ / 1M tokens');
  assert.equal(displayPriceUnit('call'), 'per call');
});

test('public gateway and model detail reads retain the price currency', async t => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgres://unused:unused@localhost/unused';
  t.after(() => {
    if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousDatabaseUrl;
  });
  t.mock.method(pg.Pool.prototype, 'query', async (sql: string) => {
    if (sql.includes('public_snapshot_entries')) return { rows: [] };
    if (sql.includes('WITH model_price_summary')) {
      assert.match(sql, /'currency', currency/);
      return { rows: [{ id: 'example', site_name: 'Example', url: 'https://example.test', prices_for_model: [{ unit: '1M_tokens', currency: 'CNY', inputPrice: 2 }] }] };
    }
    if (sql.includes('prices.input_price')) {
      assert.match(sql, /prices.currency/);
      return { rows: [{ model_id: 'gpt-example', unit: '1M_tokens', currency: 'CNY', input_price: 2 }] };
    }
    if (sql.includes('COUNT(DISTINCT prices.site_id)')) return { rows: [{ model_id: 'gpt-example' }] };
    return { rows: [{ id: 'example', slug: 'example', site_name: 'Example', url: 'https://example.test' }] };
  });
  const gateway = await loadGatewayDetail('example');
  const model = await loadGatewayModelDetail('gpt-example');
  assert.equal(gateway?.prices[0].currency, 'CNY');
  assert.equal(model?.sites[0].pricesForModel[0].currency, 'CNY');
});
