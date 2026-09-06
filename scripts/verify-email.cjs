const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
 const html = await fs.readFile('brevo-email.html', 'utf8');
 assert(Buffer.byteLength(html) < 95000, 'Gmail clipping risk');
 assert(!/src=["'](?:data:|\/api)/.test(html), 'Dynamic/embedded image');
 for(const f of ['index.html','email.html','brevo-email.txt']) assert.equal(await fs.readFile(f,'utf8'),html,`${f} drift`);
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const results=[];
 await fs.mkdir('qa',{recursive:true});
 for(const mode of ['light','dark','no-styles','blocked-images']) {
  for(const width of [320,375,480,640,1024]) {
   const page=await browser.newPage({viewport:{width,height:900},colorScheme:mode==='dark'?'dark':'light'});
   await page.route('https://argweek-email.vercel.app/assets/generated/*',async route=>{
    if(mode==='blocked-images')return route.abort();
    await route.fulfill({path:path.resolve('dist/assets/generated',new URL(route.request().url()).pathname.split('/').pop()),contentType:'image/jpeg'});
   });
   await page.setContent(mode==='no-styles'?html.replace(/<style>[\s\S]*?<\/style>/g,''):html,{waitUntil:'networkidle'});
   const info=await page.evaluate(()=>({
    width:innerWidth,scroll:document.documentElement.scrollWidth,
    images:[...document.images].map(i=>({src:i.src,width:i.naturalWidth,height:i.naturalHeight})),
    titleSize:getComputedStyle(document.querySelector('.title')).fontSize,
    background:getComputedStyle(document.body).backgroundColor,
    cta:!!document.querySelector('a.button-fallback')?.textContent.includes('inscrire'),
    centered:getComputedStyle(document.querySelector('.event-left')).textAlign,
    footerBackground:getComputedStyle(document.querySelector('.event-footer')).backgroundImage
   }));
   assert(info.scroll<=width,`${mode} ${width}: overflow ${info.scroll}`);
   if(mode!=='blocked-images')assert(info.images.every(i=>i.width>0),'broken image');
   assert(info.background==='rgb(7, 20, 54)','background drift');
   assert(info.cta,'missing CTA');
   assert.equal(await page.locator('.event-footer').evaluate(e=>getComputedStyle(e).backgroundSize),'100% auto');
   assert.equal(await page.locator('.event-wrap').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
   if(width<=480&&mode!=='no-styles')assert.equal(info.centered,'center');
   if(mode==='light'&&[375,640].includes(width))await page.screenshot({path:`qa/preview-${width}.png`,fullPage:true});
   results.push({mode,...info});await page.close();
  }
 }
 await browser.close();await fs.writeFile('qa/results.json',JSON.stringify(results,null,2));
 console.log(`PASS: ${results.length} browser checks, original image decoding, no horizontal overflow, inline-only fallback, blocked-image CTA, synchronized previews. NOT inbox-client tests.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
