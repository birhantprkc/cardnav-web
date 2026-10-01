import assert from 'node:assert/strict';
import test from 'node:test';
import { inferShopAutoCategory } from '../src/shop-auto-category.js';
import { buildShopSearchQuery, matchesShopSearchQuery } from '../src/shop-search-query.js';

const options = { matchCategory: false, matchMerchant: false };

test('category supplies the brand and tier missing from a product title', () => {
  assert.equal(inferShopAutoCategory({ productName: '月卡充值', categoryName: 'GPT Pro 20X 充值' }).id, 'gpt-pro-200');
  assert.equal(inferShopAutoCategory({ productName: 'Plus 成品号', categoryName: 'G' }).id, 'gpt-plus');
  assert.equal(inferShopAutoCategory({ productName: 'Pro 代充', categoryName: 'Claude' }).id, 'claude-pro');
  assert.equal(inferShopAutoCategory({ productName: 'ＧＰＴ Ｇｏ 月卡' }).id, 'gpt-go');
});

test('tier aliases stay within their brand and do not infer tiers from selling price', () => {
  for (const [productName, expected] of [
    ['GPT Pro 5x 月卡', 'gpt-pro-100'], ['GPT Pro 20x 月卡', 'gpt-pro-200'],
    ['GPT Pro 500 月卡', 'gpt-pro-500'], ['Claude Max 20x', 'claude-max-20x'],
    ['Gemini Pro 200 积分', 'gemini-ai-pro'], ['Kiro Pro 2000积分', 'kiro'],
    ['GPT Pro 2000积分', 'gpt-pro'], ['Claude Max20X', 'claude-max-20x'], ['GPT Pro 15x', 'gpt-pro'], ['GPT Pro5x', 'gpt-pro-100'], ['GPT Pro 月卡', 'gpt-pro'],
    ['SuperGrok Heavy', 'supergrok-heavy'], ['X Premium+', 'x-premium-plus'],
  ]) assert.equal(inferShopAutoCategory({ productName, priceNumber: 200, priceUnit: '¥' }).id, expected, productName);
});

test('conflicting brands or tiers and unknown products are not forced into a plan', () => {
  for (const row of [
    { productName: 'GPT Pro 100 / 20x' },
    { productName: 'GPT Pro 200', categoryName: 'GPT Pro 5x' },
    { productName: 'Claude Pro', categoryName: 'GPT Plus' },
    { productName: 'Claude Pro', categoryName: 'Claude Max 20x' },
    { productName: '会员充值', priceNumber: 200, priceUnit: 'USD' },
  ]) assert.equal(inferShopAutoCategory(row).id, 'other');
});

test('delivery email and verification status do not override the purchased AI plan', () => {
  assert.equal(inferShopAutoCategory({ productName: 'GPT Plus Gmail邮箱 已接码', categoryName: 'GPT' }).id, 'gpt-plus');
  assert.equal(inferShopAutoCategory({ productName: 'Codex 手机接码服务 30天', categoryName: '接码' }).id, 'phone-verification');
  assert.equal(inferShopAutoCategory({ productName: 'Outlook邮箱账号', categoryName: '邮箱' }).id, 'outlook');
});

test('plain search includes inferred category without enabling the source-category toggle', () => {
  const row = { productName: '月卡', categoryName: 'GPT Pro 20X' };
  assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery('gpt pro 200'), options), true);
  assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery('gpt pro 100'), options), false);
});

test('autocat is exact under whitespace, case, fuzzy mode, negation and grouped OR', () => {
  const row = { productName: '月卡', categoryName: 'GPT Pro 20X' };
  for (const query of ['autocat: gpt-pro-200', 'AUTOCAT:GPT-PRO-200', '(autocat:gpt-pro-200|autocat:claude) 月卡']) {
    assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery(query), { ...options, fuzzy: true }), true, query);
  }
  for (const query of ['autocat:gpt-pro', 'autocat:gpt-pro-20', '-autocat:gpt-pro-200', 'autocat:unknown', 'autocat:gpt*']) {
    assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery(query), { ...options, fuzzy: true }), false, query);
  }
  assert.equal(matchesShopSearchQuery({ productName: 'autocat gpt-pro-200', autoCategory: 'other' }, buildShopSearchQuery('autocat:gpt-pro-200'), options), false);
});

test('negated plan names and SMS services do not pollute subscription categories', () => {
  assert.equal(inferShopAutoCategory({ productName: 'Codex Go 充值，不是Plus会员' }).id, 'gpt-go');
  assert.equal(inferShopAutoCategory({ productName: 'GPT Plus / Go 月卡' }).id, 'other');
  assert.equal(inferShopAutoCategory({ productName: 'GPT Pro 20x，Plus可选' }).id, 'other');
  assert.equal(inferShopAutoCategory({ productName: '美国实卡长效接马 Codex Plus接马 30天', categoryName: '接马服务' }).id, 'phone-verification');
});


test('subscription keywords do not turn ancillary services into Plus accounts', () => {
  for (const productName of [
    'GPT Plus 开通教程', '反代教程', 'Plus 好友邀请奖励', 'GPT Plus 镜像站天卡',
    'Plus 10刀不限时', 'Plus 提链服务', '大学生认证服务', 'MAIL邮箱 绑定账号使用',
    'GPT Plus 月卡 下单后补差价',
  ]) assert.equal(inferShopAutoCategory({ productName, categoryName: 'GPT Plus', priceNumber: 1, priceUnit: '¥' }).id, 'other', productName);
  for (const productName of ['Codex 单次接马 Plus绑定', 'Plus 短效接🐎', 'Codex 手机接马 美国实卡', 'Codex 自助接验证码服务']) {
    assert.equal(inferShopAutoCategory({ productName, categoryName: 'GPT Plus 成品号' }).id, 'phone-verification', productName);
  }
});

test('low price and included instructions do not exclude genuine account delivery', () => {
  for (const productName of ['GPT Plus 成品号 赠送教程', 'GPT Plus 未接马 自助获取邮箱验证码', 'GPT Plus 已接码 发RT', 'GPT Plus 成品号 Gmail邮箱', 'GPT Plus 月卡充值', '库存老号 登录Codex需要手机接马']) {
    assert.equal(inferShopAutoCategory({ productName, categoryName: 'GPT Plus', priceNumber: 1, priceUnit: '¥' }).id, 'gpt-plus', productName);
  }
  assert.equal(inferShopAutoCategory({ productName: 'Plus 10刀额度', categoryName: 'Codex中转站' }).id, 'api-gateway');
});


test('Pro 500 recognizes separated dollar tiers and ProMax subscription names', () => {
  for (const row of [
    { productName: 'GPT Pro 25X 月卡（500刀版本）' },
    { productName: 'Codex ProMax 500刀 正价代充' },
    { productName: 'GPT Pro 会员 500美金套餐', categoryName: 'Codex Plus' },
    { productName: 'Pro25× 带账单 500刀订阅', categoryName: '正价代充 pro / plus' },
    { productName: 'GPT Pro 500刀月卡', categoryName: 'GPT Plus' },
  ]) assert.equal(inferShopAutoCategory(row).id, 'gpt-pro-500');
  assert.equal(inferShopAutoCategory({ productName: 'Kiro ProMax 5000积分' }).id, 'kiro');
  assert.equal(inferShopAutoCategory({ productName: 'GPT 500刀额度' }).id, 'gpt');
  assert.equal(inferShopAutoCategory({ productName: 'Claude Pro 500刀' }).id, 'claude-pro');
});

test('explicit relay titles and source categories take precedence over subscription tiers', () => {
  for (const row of [
    { productName: 'GPT Pro 200 中转额度' },
    { productName: 'Claude中转日卡100刀' },
    { productName: 'Plus 账号', categoryName: '中转站' },
    { productName: 'Pro 20X 500美金额度', categoryName: '中转' },
    { productName: 'API 中轉 充值' },
  ]) {
    assert.equal(inferShopAutoCategory(row).id, 'api-gateway');
    assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery('autocat: api-gateway'), options), true);
    assert.equal(matchesShopSearchQuery(row, buildShopSearchQuery('autocat: gpt-pro-200'), options), false);
  }
});
