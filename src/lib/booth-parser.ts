import type { BoothItem } from './types';

export interface ParsedSearchResult {
  items: BoothItem[];
  totalCount: number | null;
}

export function parseSearchHtml(html: string): ParsedSearchResult {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const cardSelectors = [
    'li.item-card[data-product-id]',
    '[data-product-id].item-card',
    '.item-card[data-product-id]',
  ];
  let cards: NodeListOf<Element> | null = null;
  for (const sel of cardSelectors) {
    const found = doc.querySelectorAll(sel);
    if (found.length > 0) {
      cards = found;
      break;
    }
  }

  const items: BoothItem[] = [];
  if (cards) {
    cards.forEach((card) => {
      const item = parseItemCard(card as HTMLElement);
      if (item) items.push(item);
    });
  }

  const totalCount = parseTotalCount(doc);
  return { items, totalCount };
}

function queryFirst(el: Element, selectors: string[]): Element | null {
  for (const sel of selectors) {
    const found = el.querySelector(sel);
    if (found) return found;
  }
  return null;
}

function parseItemCard(el: HTMLElement): BoothItem | null {
  const idStr = el.getAttribute('data-product-id');
  if (!idStr) return null;
  const id = Number(idStr);
  if (!Number.isFinite(id) || id <= 0) return null;

  let name = el.getAttribute('data-product-name') || '';
  const price = Number(el.getAttribute('data-product-price')) || 0;

  const images: string[] = [];
  el.querySelectorAll(
    'a.js-thumbnail-image[data-original], img[data-original], img.js-thumbnail-image',
  ).forEach((img) => {
    const src =
      img.getAttribute('data-original') || img.getAttribute('data-src') || img.getAttribute('src');
    if (src && !images.includes(src)) images.push(src);
  });

  const shopEl = queryFirst(el, ['.item-card__shop-name', '.shop-name', '[data-shop-name]']);
  const shopName = shopEl?.getAttribute('data-shop-name') || shopEl?.textContent?.trim() || null;

  const catEl = queryFirst(el, [
    '.item-card__category-anchor',
    '.item-card__category a',
    '[data-category]',
  ]);
  const categoryName = catEl?.getAttribute('data-category') || catEl?.textContent?.trim() || null;

  if (!name) {
    const titleEl = queryFirst(el, [
      '.item-card__title-anchor--multiline',
      '.item-card__title a',
      'a[data-product-name]',
      '.item-card__title',
    ]);
    name = titleEl?.getAttribute('data-product-name') || titleEl?.textContent?.trim() || '';
  }

  if (!name) return null;

  return {
    id,
    name,
    description: null,
    price,
    category_name: categoryName,
    shop_name: shopName,
    url: `https://booth.pm/ja/items/${id}`,
    images,
    tags: [],
  };
}

function parseTotalCount(doc: Document): number | null {
  const selectors = ['.u-tpg-caption1', '.search-result-count', '.u-tpg-body2', 'title'];
  for (const sel of selectors) {
    const elements = doc.querySelectorAll(sel);
    for (const el of elements) {
      const text = el.textContent || '';
      const count = extractCountFromText(text);
      if (count !== null) return count;
    }
  }
  return null;
}

function extractCountFromText(text: string): number | null {
  // Match patterns like "1,234件" or "567点"
  const match = text.match(/([\d,]+)\s*[件点]/);
  if (!match) return null;
  const n = Number(match[1].replace(/,/g, ''));
  return n > 0 ? n : null;
}

// ── Item detail parsing ──────────────────────────────────

function queryFirstDoc(doc: Document, selectors: string[]): Element | null {
  for (const sel of selectors) {
    const found = doc.querySelector(sel);
    if (found) return found;
  }
  return null;
}

export function parseItemDetailHtml(html: string, itemId: number): BoothItem | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const titleEl = queryFirstDoc(doc, [
    '[data-product-name]',
    '.u-tpg-title2',
    'h2.u-tpg-title2',
    '.item-name h1',
    'h1',
  ]);
  let name = '';
  if (titleEl) {
    name = titleEl.getAttribute('data-product-name') || titleEl.textContent?.trim() || '';
  }
  if (!name) return null;

  const priceEl = queryFirstDoc(doc, [
    '.item-price .u-tpg-body1',
    '.price',
    '.u-tpg-title2-price',
    '[data-product-price]',
  ]);
  let price = 0;
  if (priceEl) {
    const attrPrice = priceEl.getAttribute('data-product-price');
    if (attrPrice) {
      price = Number(attrPrice) || 0;
    } else {
      const priceText = (priceEl.textContent || '').replace(/[¥￥,\s\u00a0]/g, '');
      price = Number(priceText) || 0;
    }
  }

  const descEl = queryFirstDoc(doc, [
    '.u-mb-400 .u-tpg-body1',
    '.item-description',
    '.description',
  ]);
  const description = descEl?.textContent?.trim() || null;

  const images: string[] = [];
  doc
    .querySelectorAll(
      '.item-gallery img, .slick-slide img, .market-item-detail-item-image img, .js-thumbnail img',
    )
    .forEach((img) => {
      const src =
        img.getAttribute('data-origin') ||
        img.getAttribute('data-original') ||
        img.getAttribute('data-src') ||
        img.getAttribute('src');
      if (src && !images.includes(src)) images.push(src);
    });

  const shopEl = queryFirstDoc(doc, [
    '.shop-name',
    '.shop-name-mini a',
    '.u-d-ib a',
    '[data-shop-name]',
  ]);
  const shopName = shopEl?.getAttribute('data-shop-name') || shopEl?.textContent?.trim() || null;

  const tags: string[] = [];
  doc.querySelectorAll('.item-tag a, a.tag, .item-info-tag a, .tag-list a').forEach((el) => {
    const t = el.textContent?.trim();
    if (t && !tags.includes(t)) tags.push(t);
  });

  const catEl = queryFirstDoc(doc, ['.item-category a', '.category-name a', '[data-category]']);
  const categoryName = catEl?.getAttribute('data-category') || catEl?.textContent?.trim() || null;

  let wishListsCount: number | undefined;
  const wishEl = queryFirstDoc(doc, [
    '.wish-list-count',
    '[data-wish-count]',
    '.u-flex-wrap .u-tpg-body1',
  ]);
  if (wishEl) {
    const attrCount = wishEl.getAttribute('data-wish-count');
    if (attrCount) {
      const n = Number(attrCount);
      if (n >= 0) wishListsCount = n;
    } else {
      const wishText = wishEl.textContent || '';
      const wishMatch = wishText.match(/([\d,]+)/);
      if (wishMatch) {
        const n = Number(wishMatch[1].replace(/,/g, ''));
        if (n >= 0) wishListsCount = n;
      }
    }
  }

  return {
    id: itemId,
    name,
    description,
    price,
    category_name: categoryName,
    shop_name: shopName,
    url: `https://booth.pm/ja/items/${itemId}`,
    images,
    tags,
    wish_lists_count: wishListsCount,
  };
}
