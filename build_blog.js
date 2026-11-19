/**
 * Master Blog Builder for MultiTools Hub
 * 1. Combines all 20 article definitions
 * 2. Writes /blog/index.html and all 20 article HTML files
 * 3. Injects "Blog" link to index.html and all tool pages
 * 4. Injects "Related Guide" card into each tool page
 * 5. Updates sitemap.xml with all blog URLs
 */

const fs = require('fs');
const path = require('path');
const { renderArticleHtml, renderBlogIndexHtml, BLOG_DIR } = require('./blog_templates');
const articlesPart1 = require('./generate_articles_part1');
const articlesPart2 = require('./generate_articles_part2');
const articlesPart3 = require('./generate_articles_part3');

const allArticles = [...articlesPart1, ...articlesPart2, ...articlesPart3];

console.log(`Building blog with ${allArticles.length} articles...`);

// 1. Generate all blog articles
allArticles.forEach((article, index) => {
  const filePath = path.join(BLOG_DIR, `${article.slug}.html`);
  const html = renderArticleHtml(article);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[${index + 1}/${allArticles.length}] Created /blog/${article.slug}.html`);
});

// 2. Generate blog/index.html
const blogIndexHtml = renderBlogIndexHtml(allArticles);
fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexHtml, 'utf8');
console.log(`✓ Created /blog/index.html`);

// 3. Mapping from tool filename to article slug for two-way interlinking
const toolToArticleMap = {
  'all-in-one-pdf-converter.html': 'how-to-convert-images-svg-to-pdf-offline',
  'aspect-ratio-calculator.html': 'adobe-stock-shutterstock-resolution-guide',
  'bulk-image-resizer.html': 'bulk-image-resizing-batch-optimization-guide',
  'bulk-webp-converter.html': 'webp-vs-jpeg-png-website-speed-guide',
  'color-palette-extractor.html': 'how-to-extract-color-palettes-from-images',
  'ecommerce-fee-calculator.html': 'etsy-ebay-amazon-fba-fee-profit-margin-guide',
  'favicon-generator.html': 'complete-favicon-pwa-icon-setup-guide',
  'image-converter.html': 'how-to-convert-jpg-png-webp-svg-in-browser',
  'image-watermark-exif-cleaner.html': 'how-to-remove-exif-gps-metadata-from-photos',
  'invoice-receipt-generator.html': 'how-to-create-professional-us-business-invoices',
  'kdp-bleed-calculator.html': 'amazon-kdp-cover-bleed-calculation-guide',
  'mortgage-loan-calculator.html': 'understanding-us-mortgage-payments-piti-guide',
  'passport-photo-maker.html': 'how-to-take-print-us-passport-photo-at-home',
  'pdf-merger-organizer.html': 'how-to-merge-reorder-pdf-pages-privately',
  'pdf-splitter-images.html': 'how-to-split-pdf-extract-pages-convert-images',
  'qr-code-generator.html': 'high-resolution-custom-qr-codes-guide',
  'safe-zone-checker.html': 'youtube-shorts-reels-safe-zone-guide',
  'signature-generator.html': 'how-to-create-legal-digital-signatures-online',
  'svg-color-changer.html': 'how-to-recolor-svg-vector-graphics-in-browser',
  'thumbnail-previewer.html': 'how-to-test-youtube-thumbnails-mobile-desktop-ctr',
  'sales-tax-tip-calculator.html': 'us-sales-tax-dining-tip-split-guide',
  'us-timezone-meeting-planner.html': 'us-timezone-meeting-planner-remote-work-guide',
  'us-zip-areacode-lookup.html': 'us-area-code-zip-lookup-validator-guide',
  'business-card-letterhead-maker.html': 'how-to-design-print-us-business-cards-letterhead',
  'final-grade-exam-calculator.html': 'how-to-calculate-final-exam-grade-score',
  'us-vin-decoder-validator.html': 'us-vin-decoder-check-digit-lookup-guide',
  'shipping-label-envelope-printer.html': 'print-shipping-labels-envelopes-thermal-avery-guide',
  'lawn-paint-concrete-diy-estimator.html': 'diy-paint-mulch-concrete-calculator-guide',
  'military-time-date-calculator.html': 'military-time-conversion-date-duration-guide',
  'real-estate-commission-calculator.html': 'real-estate-commission-broker-split-tax-guide'
};

// 4. Update index.html navigation to add "Blog"
let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Nav Blog link
if (!indexHtml.includes('href="blog/index.html"')) {
  // Insert before About in desktop nav
  indexHtml = indexHtml.replace(
    '<a href="about.html" class="px-3 py-2 rounded-lg hover:text-indigo-600',
    '<a href="blog/index.html" class="px-3 py-2 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">Blog</a>\n        <a href="about.html" class="px-3 py-2 rounded-lg hover:text-indigo-600'
  );

  // Insert into footer
  indexHtml = indexHtml.replace(
    '<a href="about.html" class="hover:underline">About</a>',
    '<a href="blog/index.html" class="hover:underline font-semibold text-indigo-600 dark:text-indigo-400">Guides &amp; Blog</a> • <a href="about.html" class="hover:underline">About</a>'
  );

  fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml, 'utf8');
  console.log('✓ Updated index.html with Blog nav links');
}

// 5. Update every tool HTML page:
// - Add "Blog" to top navigation
// - Add "Related In-Depth Guide" card to the sidebar
const toolsDir = path.join(__dirname, 'tools');
const toolFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));

let toolsUpdated = 0;
toolFiles.forEach(toolFile => {
  const toolFilePath = path.join(toolsDir, toolFile);
  let html = fs.readFileSync(toolFilePath, 'utf8');
  const slug = toolToArticleMap[toolFile];
  const article = allArticles.find(a => a.slug === slug);

  // A. Add "Blog" link to nav if missing
  if (!html.includes('href="../blog/index.html"') && !html.includes('href="blog/index.html"')) {
    html = html.replace(
      '<a href="../about.html"',
      '<a href="../blog/index.html" class="px-3 py-2 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">Blog</a>\n        <a href="../about.html"'
    );
  }

  // B. Add "Related Guide" card in sidebar if not already added
  if (article && !html.includes(`href="../blog/${slug}.html"`)) {
    const guideCardHtml = `
        <!-- Related Step-by-Step Guide Card -->
        <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm space-y-3">
          <div class="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <i data-lucide="book-open" class="w-4 h-4"></i>
            <span>Recommended Reading</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white leading-snug">
            <a href="../blog/${slug}.html" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              ${article.title}
            </a>
          </h4>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Read our complete 2026 problem-solving tutorial with step-by-step instructions, practical use cases, and expert tips.
          </p>
          <div class="pt-2">
            <a href="../blog/${slug}.html" class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group">
              <span>Read Step-by-Step Guide</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"></i>
            </a>
          </div>
        </div>
`;

    // Insert before the sticky sidebar closing or before Related Tools
    if (html.includes('<aside class="lg:col-span-4 space-y-6">')) {
      html = html.replace(
        '<aside class="lg:col-span-4 space-y-6">',
        '<aside class="lg:col-span-4 space-y-6">' + guideCardHtml
      );
    } else if (html.includes('<aside class="lg:col-span-5 space-y-6">')) {
      html = html.replace(
        '<aside class="lg:col-span-5 space-y-6">',
        '<aside class="lg:col-span-5 space-y-6">' + guideCardHtml
      );
    }
  }

  fs.writeFileSync(toolFilePath, html, 'utf8');
  toolsUpdated++;
});

console.log(`✓ Updated ${toolsUpdated} tool pages with Blog nav links and Related Guide cards`);

// 6. Update sitemap.xml
let sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');

let sitemapAdditions = '';

// Add /blog/index.html
if (!sitemap.includes('https://multitools-hub.web.app/blog/index.html')) {
  sitemapAdditions += `  <url>
    <loc>https://multitools-hub.web.app/blog/index.html</loc>
    <lastmod>2026-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
}

// Add every article URL
allArticles.forEach(a => {
  const url = `https://multitools-hub.web.app/blog/${a.slug}.html`;
  if (!sitemap.includes(url)) {
    sitemapAdditions += `  <url>
    <loc>${url}</loc>
    <lastmod>2026-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }
});

if (sitemapAdditions) {
  sitemap = sitemap.replace('</urlset>', sitemapAdditions + '</urlset>');
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
  console.log('✓ Updated sitemap.xml with /blog/index.html and all 20 article URLs');
}

console.log('\nAll Blog Generation & Interlinking Completed Successfully!');
