// Synthetic regression for the observed inversion, not Gmail inbox certification.
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const b=await chromium.launch({channel:'chrome'});
 try {
  const p=await b.newPage({viewport:{width:375,height:900}});
  await p.route('https://argweek-email.vercel.app/assets/generated/*',r=>r.fulfill({path:path.resolve('dist/assets/generated',new URL(r.request().url()).pathname.split('/').pop())}));
  await p.setContent(fs.readFileSync('brevo-email.html','utf8'),{waitUntil:'networkidle'});
  const protectedAreas=await p.locator('.programme,.event-footer').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage));
  assert(protectedAreas.every(s=>s.includes('linear-gradient')), 'Unprotected navy area');
  await p.evaluate(()=>{
   const content=document.createElement('div');content.className='body';
   while(document.body.firstChild)content.appendChild(document.body.firstChild);
   document.body.className='';document.body.append(document.createElement('u'),content);
   // Model the screenshot's lightened solid backgrounds and darkened white text.
   for(const e of content.querySelectorAll('[style]')){
    const cs=getComputedStyle(e);
    if(cs.backgroundColor==='rgb(7, 20, 54)')e.style.backgroundColor='#eaeaff';
    if(cs.color==='rgb(255, 255, 255)')e.style.color='#000000';
   }
   const style=document.createElement('style');
   style.textContent='u + .body .gmail-screen,u + .body .gmail-difference{background:#ffffff!important}';
   document.head.appendChild(style);
   // Actual Gmail auto-link treatment is separately targeted by the stylesheet.
  });
  await p.screenshot({path:'qa/synthetic-inversion-375.png',fullPage:true});
  const result=await p.locator('.programme,.event-footer').evaluateAll(es=>es.map(e=>getComputedStyle(e).backgroundImage));
  assert(result.every(s=>s.includes('linear-gradient')));
  assert(await p.locator('.button-fallback img').evaluate(e=>e.complete&&e.naturalWidth===540));
  console.log('PASS: protected background layers and raster CTA under synthetic color inversion. Requires real Brevo/Gmail retest.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
