/**
 * 文件说明: 使用隔离的 PostgreSQL schema 验证搜索日统计与累计统计的原子写入。
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import pg from 'pg';

test('search writes Beijing daily and lifetime counts atomically', {
  skip: !process.env.CARDNAV_TEST_DATABASE_URL,
}, async () => {
  const databaseUrl = process.env.CARDNAV_TEST_DATABASE_URL!;
  const schema = `cardnav_search_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: databaseUrl });
  const originalPool = pg.Pool;
  const openedPools: pg.Pool[] = [];
  const originalDatabaseUrl = process.env.DATABASE_URL;

  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    await admin.query(`
      CREATE TABLE ${schema}.shop_search_terms_daily (
        observed_date DATE NOT NULL, term TEXT NOT NULL,
        search_count INTEGER NOT NULL DEFAULT 0, no_result_count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (observed_date, term)
      );
      CREATE TABLE ${schema}.shop_search_terms (
        term TEXT PRIMARY KEY, total_count INTEGER NOT NULL DEFAULT 0,
        result_count INTEGER NOT NULL DEFAULT 0, last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    const testUrl = new URL(databaseUrl);
    testUrl.searchParams.set('options', `-c search_path=${schema}`);
    process.env.DATABASE_URL = testUrl.toString();
    (pg as { Pool: typeof pg.Pool }).Pool = class extends originalPool {
      constructor(config?: pg.PoolConfig) {
        super(config);
        openedPools.push(this);
      }
    };

    const { recordSearchTerm } = await import('../src/store.js');
    await recordSearchTerm('  Claude  ', 0);
    await recordSearchTerm('Claude', 3);
    const daily = await admin.query(`SELECT term, search_count, no_result_count,
      observed_date = (now() AT TIME ZONE 'Asia/Shanghai')::date AS beijing_date
      FROM ${schema}.shop_search_terms_daily`);
    const lifetime = await admin.query(`SELECT term, total_count, result_count FROM ${schema}.shop_search_terms`);
    assert.deepEqual(daily.rows, [{ term: 'claude', search_count: 2, no_result_count: 1, beijing_date: true }]);
    assert.deepEqual(lifetime.rows, [{ term: 'claude', total_count: 2, result_count: 3 }]);

    await admin.query(`DROP TABLE ${schema}.shop_search_terms`);
    await assert.rejects(recordSearchTerm('rollback check', 0));
    const rolledBack = await admin.query(`SELECT 1 FROM ${schema}.shop_search_terms_daily WHERE term = 'rollback check'`);
    assert.equal(rolledBack.rowCount, 0);
  } finally {
    (pg as { Pool: typeof pg.Pool }).Pool = originalPool;
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    await Promise.all(openedPools.map(pool => pool.end()));
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});
