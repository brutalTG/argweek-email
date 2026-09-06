const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function build() {
  const root = __dirname;
  const out = path.join(root, 'dist');
  await fs.mkdir(path.join(out, 'assets/generated'), { recursive: true });
  await fs.mkdir(path.join(root, 'assets/generated'), { recursive: true });
  for (const name of ['header', 'milei', 'officials', 'footer']) {
    const source = path.join(root, 'assets/source', `${name}.png`);
    // Decode the original completely. A corrupt image must fail deployment.
    await sharp(source).raw().toBuffer();
    const jpeg = await sharp(source).flatten({ background: '#071436' })
      .jpeg({ quality: 94, chromaSubsampling: '4:4:4', progressive: false }).toBuffer();
    const { info } = await sharp(jpeg).raw().toBuffer({ resolveWithObject: true });
    for (const file of [`${name}-email.jpg`, `${name}-brevo-v1.jpg`]) {
      await fs.writeFile(path.join(root, 'assets/generated', file), jpeg);
      await fs.writeFile(path.join(out, 'assets/generated', file), jpeg);
    }
    console.log(`${name}: decoded ${info.width}x${info.height}, ${jpeg.length} bytes`);
  }
  const button = await fs.readFile(path.join(root, 'assets/source/register-button.png'));
  await sharp(button).raw().toBuffer();
  await fs.writeFile(path.join(out, 'assets/generated/register-button-v1.png'), button);
  await fs.writeFile(path.join(root, 'assets/generated/register-button-v1.png'), button);
  const html = await fs.readFile(path.join(root, 'brevo-email.html'), 'utf8');
  for (const file of ['index.html', 'email.html', 'brevo-email.html', 'email-next.html']) {
    await fs.writeFile(path.join(out, file), html);
    if (file !== 'brevo-email.html') await fs.writeFile(path.join(root, file), html);
  }
  await fs.writeFile(path.join(root, 'brevo-email.txt'), html);
  await fs.writeFile(path.join(out, 'brevo-email.txt'), html);
  await fs.writeFile(path.join(out, 'brevo-email-download.html'), html);
  const escaped = html.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const code = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HTML para Brevo · Argentina Week Paris</title><body style="margin:24px;background:#071436;color:#ffffff;font:16px/1.5 Arial,sans-serif"><h1 style="font-size:24px">Argentina Week Paris · HTML para Brevo</h1><p>Textos de muestra y enlace simulado conservados. Importar en «HTML custom code».</p><p><a style="color:#ffffff" href="/email">Ver invitación</a> · <a style="color:#ffffff" href="/brevo-email-download.html" download="brevo-email.html">Descargar HTML</a> · <a style="color:#ffffff" href="/brevo-email.txt">Abrir código como texto</a></p><button id="copy" style="padding:12px 24px">Copiar HTML completo</button><span id="status" role="status"></span><textarea id="source" aria-label="HTML completo para Brevo" spellcheck="false" style="box-sizing:border-box;width:100%;height:65vh;margin-top:16px;font:13px/1.5 monospace">${escaped}</textarea><script>document.getElementById('copy').onclick=async()=>{const s=document.getElementById('source');s.focus();s.select();try{await navigator.clipboard.writeText(s.value);document.getElementById('status').textContent=' Copiado';}catch{document.getElementById('status').textContent=' Código seleccionado: usá Copiar.';}};</script></body></html>`;
  await fs.writeFile(path.join(root, 'code.html'), code);
  await fs.writeFile(path.join(out, 'code.html'), code);
}
build().catch(error => { console.error(error); process.exitCode = 1; });
