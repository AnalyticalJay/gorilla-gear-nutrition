import fs from 'node:fs';
import { load } from 'cheerio';

const htmlPath = '/home/ubuntu/browser_html/take_app_cm8ppj2d70000l80347gq1adn_1786568532982.html';
const outputPath = '/home/ubuntu/gorilla-gear-nutrition/hdlabs-injectables-source.json';
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = load(html);
const products = [];
const seen = new Set();

$('a').each((_index, element) => {
  const anchor = $(element);
  const href = anchor.attr('href') ?? '';
  const image = anchor.find('img').first();
  if (!image.length || !href.includes('/p/')) return;
  const name = image.attr('alt')?.trim() || anchor.find('h3, h4, p').first().text().trim();
  const imageUrl = image.attr('src') || image.attr('data-src') || image.attr('data-lazy-src');
  if (!name || !imageUrl || seen.has(name.toLowerCase())) return;
  seen.add(name.toLowerCase());
  products.push({ name, imageUrl, productUrl: new URL(href, 'https://take.app').toString() });
});

fs.writeFileSync(outputPath, JSON.stringify({ sourceUrl: 'https://take.app/hdlabsinternational/c/cm8ppj2d70000l80347gq1adn', count: products.length, products }, null, 2));
console.log(JSON.stringify({ count: products.length, products }, null, 2));
