/**
 * 文件说明: 验证公开站赞助商配置读取、可见性过滤和多语言解析契约。
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { getVisibleSponsors } from '../src/sponsors.js';

test('visible sponsor list includes active sponsors and hides disabled sponsors', () => {
  const sponsors = getVisibleSponsors('zh');
  const sponsorIds = sponsors.map(sponsor => sponsor.id);

  assert.ok(sponsorIds.includes('geniuscoder'));
  assert.ok(sponsorIds.includes('racknerd'));
  assert.ok(!sponsorIds.includes('yunwu-api'));
  assert.ok(!sponsorIds.includes('token-plus'));
});

test('sponsor locale content is resolved before rendering', () => {
  const sponsor = getVisibleSponsors('zh').find(item => item.id === 'geniuscoder');

  assert.equal(sponsor?.title, 'GeniusCoder');
  assert.equal(sponsor?.url, 'https://api.geniuscoder.net/register?aff=JACMJSU7N7PX');
  assert.match(sponsor?.description ?? '', /OpenAI SDK 兼容/);
});
