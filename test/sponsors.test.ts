/**
 * 文件说明: 验证公开站赞助商预设列表和多语言解析契约。
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { getSponsors } from '../src/sponsor-provider.js';

test('full sponsor list follows the preset list', () => {
  const sponsors = getSponsors({ placement: 'page-bottom', pageType: 'about', locale: 'zh' });
  const sponsorIds = sponsors.map(sponsor => sponsor.id);

  assert.ok(sponsorIds.includes('geniuscoder'));
  assert.ok(sponsorIds.includes('infistar'));
  assert.ok(sponsorIds.includes('racknerd'));
  assert.ok(!sponsorIds.includes('yunwu-api'));
  assert.ok(!sponsorIds.includes('token-plus'));
});

test('sponsor locale content is resolved before rendering', () => {
  const sponsor = getSponsors({ placement: 'page-bottom', pageType: 'about', locale: 'zh' }).find(item => item.id === 'geniuscoder');

  assert.equal(sponsor?.title, 'GeniusCoder');
  assert.equal(sponsor?.url, 'https://api.geniuscoder.net/register?aff=JACMJSU7N7PX');
  assert.match(sponsor?.description ?? '', /OpenAI SDK 兼容/);
});

test('global placement uses the existing sponsor list and page placements can be empty', () => {
  const globalSponsors = getSponsors({ placement: 'page-bottom', pageType: 'about', locale: 'zh' });

  assert.deepEqual(
    globalSponsors.map(sponsor => sponsor.id),
    ['infistar', 'geniuscoder', 'lingxi-ai', 'packy-api', 'ssrdog', 'gougou', 'racknerd', 'bandwagon'],
  );
  assert.deepEqual(
    getSponsors({ placement: 'after-hero', pageType: 'gateway', locale: 'zh' }).map(sponsor => sponsor.id),
    ['infistar', 'geniuscoder', 'lingxi-ai', 'packy-api'],
  );
  assert.deepEqual(getSponsors({ placement: 'after-hero', pageType: 'shop-keyword', locale: 'zh' }), []);
  assert.deepEqual(getSponsors({ placement: 'page-bottom', pageType: 'guide', locale: 'zh' }), []);
  assert.deepEqual(
    getSponsors({ placement: 'content-bottom', pageType: 'guide', locale: 'zh' }).map(sponsor => sponsor.id),
    ['infistar', 'geniuscoder', 'lingxi-ai', 'packy-api', 'ssrdog', 'gougou', 'racknerd', 'bandwagon'],
  );
});
