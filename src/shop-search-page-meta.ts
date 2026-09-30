/**
 * 文件说明: 生成卡网商品预设搜索结果页的标题、描述和前端可更新的页面 meta。
 */
export type ShopSearchPageMetaMessages = {
  searchResultsTitle: string;
  searchResultsDescription: string;
  titleSuffix?: string;
};

export type ShopSearchPageMeta = {
  pageTitle: string;
  pageDescription: string;
  heroTitle: string;
  heroDescription: string;
  documentTitle: string;
};

function applyTermTemplate(template: string, termLabel: string) {
  return template.replaceAll('{term}', termLabel);
}

export function buildShopSearchPageMeta(termLabel: string, messages: ShopSearchPageMetaMessages, heroLabel = termLabel): ShopSearchPageMeta {
  const pageTitle = applyTermTemplate(messages.searchResultsTitle, termLabel);
  const pageDescription = applyTermTemplate(messages.searchResultsDescription, termLabel);
  const titleSuffix = messages.titleSuffix?.trim() ?? '';

  return {
    pageTitle,
    pageDescription,
    heroTitle: applyTermTemplate(messages.searchResultsTitle, heroLabel),
    heroDescription: pageDescription,
    documentTitle: titleSuffix ? `${pageTitle} - ${titleSuffix}` : pageTitle,
  };
}
