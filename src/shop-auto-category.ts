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
  { id: 'gpt-pro-500', label: 'GPT Pro 500', family: 'gpt', pattern: /pro(?:\s*max)?\s*500(?!\d)|(?<!\d)500\s*(?:美刀|刀|美元|美金|usd|\$)(?![a-z])/ },
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
  { id: 'api-gateway', label: '中转站', family: 'api-gateway' },
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
  if (id === 'api-gateway') return language === 'en' ? 'API gateway' : language === 'ru' ? 'API-шлюз' : '中转站';
  if (id === 'other') return language === 'en' ? 'Other' : language === 'ru' ? 'Другое' : '其他';
  if (id === 'phone-verification') return language === 'en' ? 'Phone verification' : language === 'ru' ? 'SMS-верификация' : '接码';
  return categoriesById.get(id)?.label ?? autoCategoryLabel('other', language);
}

export function inferShopAutoCategory(input: AutoCategoryInput): CategoryRule {
  const title = normalize(input.productName).replace(/(?:不是|并非|不含|非)\s*(?:plus|pro|go|free|team)(?:\s*[和与/]\s*(?:plus|pro|go|free|team))*/g, '').replace(/可与\s*plus\s*并存|plus\s*升级/g, '');
  const category = normalize(input.categoryName ?? '');
  // 先识别出售对象，商家套餐分类不能把教程、辅助服务和额度变成订阅。
  if (/中转|中轉/.test(`${title} ${category}`)) return categoriesById.get('api-gateway')!;
  const accountDelivery = /成品|账号|帐号|账户|普号|老号|新号|发\s*(?:rt|at)|带\s*(?:rt|at)|账密|帐密|质保首登/.test(title);
  const verificationStatus = /(?:已|未|无|需要自己|自行)接[码马🐴🐎]|未绑定手机/.test(title);
  const subscriptionDelivery = accountDelivery || verificationStatus || /(?:会员|订阅|月卡|年卡).*(?:充值|代充)|(?:充值|代充).*(?:会员|订阅|月卡|年卡)/.test(title);
  const serviceTitle = title.replace(/(?:附赠|赠送|附带|提供|含|带)(?:使用|操作|注册|开通|详细)?教程/g, '');
  if (/教程|不要下单|勿拍|测试商品|好友邀请|邀请奖励|提链|补差价|认证服务|学生认证/.test(serviceTitle)) return other;
  if (/镜像|中转站|号池|api\s*(?:额度|余额|充值)|(?:额度|余额)\s*(?:卡|充值)|\d+\s*(?:刀|美元|美金)\s*不限时/.test(title)
    && !accountDelivery) return other;
  if (/中转站|镜像|号池/.test(category) && !subscriptionDelivery) return other;
  const verificationRequest = title.replace(/(?:已|未|无|需要自己|自行)接[码马🐴🐎]/gu, '');
  if (!subscriptionDelivery && (/接[码马🐴🐎]|接验证码|短信验证码|短信接收/.test(verificationRequest)
    || /接[码马🐴🐎]|短信验证码/.test(category))) {
    return categoriesById.get('phone-verification')!;
  }
  // 邮箱是独立商品时不继承店铺的 Plus 分类；账号交付邮箱不触发此排除。
  if (/邮箱/.test(title) && !/plus|pro|gpt|codex|claude|gemini/.test(title) && (!accountDelivery || /绑定账号使用|绑定帐号使用/.test(title))) return other;
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
  // 省略品牌的 Pro 500 订阅使用明确档位与订阅交付交叉确认，不能只凭售价。
  if (!family && /pro/.test(title) && /(?<!\d)500\s*(?:刀|美元|美金|美刀|usd|\$)/.test(title) && /订阅|月卡|代充|充值/.test(title)) family = 'gpt';
  if (!family) return other;
  const rules = autoCategories.filter(rule => rule.family === family);
  const matches = (source: string) => rules.filter(rule => rule.pattern?.test(source) && (!rule.priceRange || (
    input.priceNumber != null && Number.isFinite(input.priceNumber) && input.priceUnit === rule.priceRange.unit
    && input.priceNumber >= rule.priceRange.min && input.priceNumber <= rule.priceRange.max
  )));
  const titleMatches = matches(title).filter(rule => rule.id !== 'gpt-pro-500' || /pro/.test(title));
  const categoryMatches = matches(category).filter(rule => rule.id !== 'gpt-pro-500' || /pro/.test(category));
  // 具体档位不能同时命中；数字边界防止 2000 积分被当成 200 档套餐。
  const tiers = [...new Set([...titleMatches, ...categoryMatches].filter(rule => /(?:pro-\d+|max-\d+x)$/.test(rule.id)).map(rule => rule.id))];
  if (tiers.length > 1) return other;
  if (tiers.length === 1) {
    const hasExplicitTitleTier = titleMatches.some(rule => rule.id === tiers[0]);
    const planMatches = hasExplicitTitleTier ? titleMatches : [...titleMatches, ...categoryMatches];
    if (family === 'gpt' && planMatches.some(rule => /gpt-(plus|go|team|free)$/.test(rule.id))) return other;
    if (family === 'claude' && planMatches.some(rule => rule.id === 'claude-pro')) return other;
    return rules.find(rule => rule.id === tiers[0])!;
  }
  if (family === 'gpt' && titleMatches.length > 1) return other;
  const selected = titleMatches[0] ?? categoryMatches[0];
  if (titleMatches[0] && categoryMatches[0] && titleMatches[0].id !== categoryMatches[0].id) return other;
  return selected ?? rules.find(rule => !rule.pattern) ?? other;
}
