/** 商品自动分类：标题和原分类共同判断；明确套餐优先，冲突和未知商品归其他。 */
export type AutoCategoryInput = {
  productName: string;
  categoryName?: string;
  priceNumber?: number | null;
  priceUnit?: string | null;
};

type CategoryRule = {
  id: string;
  label: string;
  family: string;
  pattern?: RegExp;
  // 价格仅作为附加约束，不能脱离文本识别套餐；范围包含端点且必须匹配币种。
  priceRange?: { min: number; max: number; unit: string };
};

export const autoCategories: readonly CategoryRule[] = [
  { id: 'gpt-pro-100', label: 'GPT Pro 100', family: 'gpt', pattern: /pro\s*100(?!\d)|(?<!\d)(?:5\s*x|x\s*5|100\s*(?:刀|美元|美金|usd|\$))(?![\da-z])/ },
  { id: 'gpt-pro-200', label: 'GPT Pro 200', family: 'gpt', pattern: /pro\s*200(?!\d)|(?<!\d)(?:20\s*x|x\s*20|200\s*(?:刀|美元|美金|usd|\$))(?![\da-z])/ },
  { id: 'gpt-pro-500', label: 'GPT Pro 500', family: 'gpt', pattern: /pro\s*500(?!\d)|(?<!\d)500\s*(?:刀|美元|美金|usd|\$)\s*pro/ },
  { id: 'gpt-pro', label: 'GPT Pro', family: 'gpt', pattern: /pro/ },
  { id: 'gpt-team', label: 'GPT Team / Business', family: 'gpt', pattern: /team|business|团队|企业/ },
  { id: 'gpt-plus', label: 'GPT Plus', family: 'gpt', pattern: /plus/ },
  { id: 'gpt-go', label: 'GPT Go', family: 'gpt', pattern: /(?:gpt|chat|\bg)\s*go\b|\bgo\b/ },
  { id: 'gpt-free', label: 'GPT Free', family: 'gpt', pattern: /free|普号|普通号|普通账号|免费/ },
  { id: 'gpt', label: 'GPT', family: 'gpt' },
  { id: 'claude-max-5x', label: 'Claude Max 5x', family: 'claude', pattern: /(?<!\d)(?:5\s*x|x\s*5|100\s*(?:刀|美元|美金|usd|\$))(?![\da-z])/ },
  { id: 'claude-max-20x', label: 'Claude Max 20x', family: 'claude', pattern: /(?<!\d)(?:20\s*x|x\s*20|200\s*(?:刀|美元|美金|usd|\$))(?![\da-z])/ },
  { id: 'claude-max', label: 'Claude Max', family: 'claude', pattern: /max/ },
  { id: 'claude-pro', label: 'Claude Pro', family: 'claude', pattern: /pro/ },
  { id: 'claude', label: 'Claude', family: 'claude' },
  { id: 'gemini-ai-ultra', label: 'Gemini Ultra', family: 'gemini', pattern: /ultra|ulrta/ },
  { id: 'gemini-ai-pro', label: 'Gemini Pro', family: 'gemini', pattern: /pro|advanced/ },
  { id: 'gemini-ai-plus', label: 'Gemini AI Plus', family: 'gemini', pattern: /plus/ },
  { id: 'gemini', label: 'Gemini', family: 'gemini' },
  { id: 'supergrok-heavy', label: 'SuperGrok Heavy', family: 'grok', pattern: /heavy/ },
  { id: 'supergrok', label: 'SuperGrok', family: 'grok', pattern: /super\s*gro/ },
  { id: 'grok', label: 'Grok', family: 'grok' },
  { id: 'cursor', label: 'Cursor', family: 'cursor' },
  { id: 'kiro', label: 'Kiro', family: 'kiro' },
  { id: 'windsurf', label: 'Windsurf', family: 'windsurf' },
  { id: 'perplexity', label: 'Perplexity', family: 'perplexity' },
  { id: 'midjourney', label: 'Midjourney', family: 'midjourney' },
  { id: 'sora', label: 'Sora', family: 'sora' },
  { id: 'suno', label: 'Suno', family: 'suno' },
  { id: 'x-premium-plus', label: 'X Premium+', family: 'x', pattern: /premium\s*(?:\+|plus)/ },
  { id: 'x-premium', label: 'X Premium', family: 'x', pattern: /premium/ },
  { id: 'x', label: 'X / Twitter', family: 'x' },
  { id: 'gmail', label: 'Gmail', family: 'gmail' },
  { id: 'outlook', label: 'Outlook', family: 'outlook' },
  { id: 'apple-id', label: 'Apple ID', family: 'apple-id' },
  { id: 'tiktok', label: 'TikTok', family: 'tiktok' },
  { id: 'paypal', label: 'PayPal', family: 'paypal' },
  { id: 'telegram', label: 'Telegram', family: 'telegram' },
  { id: 'phone-verification', label: '接码', family: 'phone-verification' },
  { id: 'canva', label: 'Canva', family: 'canva' },
  { id: 'deepseek', label: 'DeepSeek', family: 'deepseek' },
  { id: 'seedance', label: 'Seedance / 即梦', family: 'seedance' },
  { id: 'copilot', label: 'Copilot', family: 'copilot' },
  { id: 'kimi', label: 'Kimi', family: 'kimi' },
  { id: 'minimax', label: 'MiniMax', family: 'minimax' },
  { id: 'netflix', label: 'Netflix', family: 'netflix' },
  { id: 'spotify', label: 'Spotify', family: 'spotify' },
  { id: 'youtube', label: 'YouTube', family: 'youtube' },
  { id: 'notion', label: 'Notion', family: 'notion' },
  { id: 'other', label: '其他', family: 'other' },
];

const families: [string, RegExp][] = [
  ['gpt', /chat\s*gpt|gpt|gtp|open\s*\/?\s*ai|codex|(?:^|[^a-z])(?:gp|g|chat)(?=[\s\-月充成系官日普家直【]|plus|pro|go|$)/],
  ['claude', /claude|克劳德/], ['gemini', /gemini|google\s*ai|反重力/],
  ['grok', /gro[.\s]*k|\bgro\b|supergro/], ['cursor', /cursor/], ['kiro', /kiro/],
  ['windsurf', /windsurf/], ['perplexity', /perplexity/], ['midjourney', /midjourney/],
  ['canva', /canva/],
  ['deepseek', /deepseek/],
  ['seedance', /seedance|即梦/],
  ['copilot', /copilot/],
  ['kimi', /kimi/],
  ['minimax', /minimax/],
  ['netflix', /netflix|奈飞/],
  ['spotify', /spotify/],
  ['youtube', /youtube|油管/],
  ['notion', /notion/],
  ['sora', /sora/], ['suno', /suno/],
];
const accounts: [string, RegExp][] = [
  ['gmail', /gmail|谷歌(?:邮箱|账号|账户)|google/], ['outlook', /outlook|hotmail|微软邮箱/],
  ['apple-id', /apple\s*id|苹果\s*id/], ['tiktok', /tik\s*tok/], ['paypal', /paypal/],
  ['telegram', /telegram|电报|飞机号|\btg\b/], ['x', /twitter|推特|\bx\s*(?:premium|账号|帐号|账户)/],
];
const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
const categoriesById = new Map(autoCategories.map(rule => [rule.id, rule]));
const other = categoriesById.get('other')!;

export function autoCategoryLabel(id: string, language = 'zh'): string {
  if (id === 'other') return language === 'en' ? 'Other' : language === 'ru' ? 'Другое' : '其他';
  if (id === 'phone-verification') return language === 'en' ? 'Phone verification' : language === 'ru' ? 'SMS-верификация' : '接码';
  return categoriesById.get(id)?.label ?? autoCategoryLabel('other', language);
}

export function inferShopAutoCategory(input: AutoCategoryInput): CategoryRule {
  const title = normalize(input.productName).replace(/(?:不是|并非|不含|非)\s*(?:plus|pro|go|free|team)(?:\s*[和与/]\s*(?:plus|pro|go|free|team))*/g, '').replace(/可与\s*plus\s*并存|plus\s*升级/g, '');
  const category = normalize(input.categoryName ?? '');
  const text = `${title} ${category}`;
  // 接码服务优先；“已接码/未接码”的成品账号仍按账号套餐判断。
  if (/接[码马🐴]/u.test(text) && !/成品|(?:账号|帐号|账户|普号).*(?:已接|未接)|(?:已接|未接).*(?:账号|帐号|账户|普号)/.test(title)
    && ((/接[码马🐴]/u.test(category) && !/成品|账号|帐号|账户/.test(title)) || /接[码马🐴].*(?:服务|次数|分钟|天)|(?:注册|验证).*接[码马🐴]/u.test(title))) {
    return autoCategories.find(rule => rule.id === 'phone-verification')!;
  }
  const titleFamilies = families.filter(([, pattern]) => pattern.test(title)).map(([id]) => id);
  const categoryFamilies = families.filter(([, pattern]) => pattern.test(category)).map(([id]) => id);
  const detected = [...new Set([...titleFamilies, ...categoryFamilies])];
  if (detected.length > 1) return other;
  let family = detected[0];
  if (!family) {
    const titleAccounts = accounts.filter(([, pattern]) => pattern.test(title)).map(([id]) => id);
    const accountMatches = titleAccounts.length ? titleAccounts : accounts.filter(([, pattern]) => pattern.test(category)).map(([id]) => id);
    if (accountMatches.length > 1) return other;
    family = accountMatches[0];
  }
  if (!family) return other;
  const rules = autoCategories.filter(rule => rule.family === family);
  const matches = (source: string) => rules.filter(rule => rule.pattern?.test(source) && (!rule.priceRange || (
    input.priceNumber != null && Number.isFinite(input.priceNumber) && input.priceUnit === rule.priceRange.unit
    && input.priceNumber >= rule.priceRange.min && input.priceNumber <= rule.priceRange.max
  )));
  const titleMatches = matches(title);
  const categoryMatches = matches(category);
  // 具体档位不能同时命中；数字边界防止 2000 积分被当成 200 档套餐。
  const tiers = [...new Set([...titleMatches, ...categoryMatches].filter(rule => /(?:pro-\d+|max-\d+x)$/.test(rule.id)).map(rule => rule.id))];
  if (tiers.length > 1) return other;
  if (tiers.length === 1) {
    const planMatches = [...titleMatches, ...categoryMatches];
    if (family === 'gpt' && planMatches.some(rule => /gpt-(plus|go|team|free)$/.test(rule.id))) return other;
    if (family === 'claude' && planMatches.some(rule => rule.id === 'claude-pro')) return other;
    return rules.find(rule => rule.id === tiers[0])!;
  }
  if (family === 'gpt' && titleMatches.length > 1) return other;
  const selected = titleMatches[0] ?? categoryMatches[0];
  if (titleMatches[0] && categoryMatches[0] && titleMatches[0].id !== categoryMatches[0].id) return other;
  return selected ?? rules.find(rule => !rule.pattern) ?? other;
}
