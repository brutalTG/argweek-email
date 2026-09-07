# Argentina Week Paris — Brevo

The source of truth is **brevo-email.html**. `npm run build` generates identical `/`, `/email`, `/brevo-email` previews, a plain-text copy and a download. Vercel serves only `dist/`: no image API or Base64 reconstruction is used by this email.

- Preview: https://argweek-email.vercel.app/email
- Copy/download page: https://argweek-email.vercel.app/code
- Plain source: https://argweek-email.vercel.app/brevo-email.txt
- HTML download: https://argweek-email.vercel.app/brevo-email-download

## Import into Brevo

Choose **Start from scratch → HTML custom code** and paste the complete contents of `brevo-email.html`, or use the file upload if available. Do not paste into a rich-text block or the drag-and-drop developer mode. The copy page has a selectable text area and a copy button.

The invitation is now in English with user-supplied copy and images. The CTA links to the supplied Google registration form; the footer contact is a mailto link. Venue text remains unchanged. The ambiguous supplied `14:30 p.m.` was normalized to `2:30 p.m.`. The programme block is absent. Configure unsubscribe handling in Brevo before a campaign send.


## Images and recovery

The former Base64 payloads decoded to malformed JPEGs (ministers/footer could not be decoded). Recovered the actual local originals: Frame 1245.png (header), Milei.png, Group 368.png (ministers), Frame 1246.png (texture). They are preserved in `assets/source/`. Sharp decodes each fully, flattens transparency onto #071436, and produces baseline sRGB JPEGs at their original dimensions. No invented portraits, upscaling or AI reconstruction.

The email uses direct public HTTPS `assets/generated/*-brevo-v1.jpg` paths. Existing `*-email.jpg` paths also receive repaired images. When changing images in a future sent campaign, introduce a new versioned filename to avoid email proxy caches. The build fails on corrupt inputs or output decoding errors. Old malformed files are historical only and are not copied to the published directory.

## Rendering

- Fluid 640px presentation tables, explicit spacing/borders, inline color and bgcolor fallbacks.
- Title 30px desktop / 24px mobile; intro 16px / 15px; no external fonts.
- Date/place/schedule centered and enclosed by horizontal rules on mobile.
- Solid navy on all sections, including programme; opaque portraits preserve image colors.
- Apple color-scheme styles, Outlook conditional 640px wrapper and 96 DPI settings, Gmail iOS blend layers for white live text.
- A single texture spans event details and CTA, bottom-aligned at `background-size:100% auto` (full width, original proportions, no cover zoom). Child cells are transparent. Outlook uses a fixed 640×637px VML fill in the 640px container. Footer texture is decorative with Outlook VML and a navy fallback. CTA label and explanation remain live HTML. The button is now a linked 3x PNG with an accessible label and image alt text, preserving white/navy colors under Gmail inversion; if images are blocked, its alt text remains the link. Losing the decorative background does not lose content or clickability.

**No email HTML can guarantee exact colors in every forced-dark-mode Gmail/Outlook version.** Browser light/dark emulation does not reproduce inbox transformations. Recipient image blocking also cannot be overridden. Test sends from the actual Brevo account to Gmail, Outlook Windows and Apple Mail (light and dark) remain necessary; these have not been performed.

## Validation

`npm ci && npm run build && npm test` (test uses installed Google Chrome).

Tests decode all assets, check synchronized HTML, clipping size, image load, horizontal overflow at 320/375/480/640/1024px, light/dark browser modes, stylesheet removal, and image blocking with live CTA. Screenshots/results are saved locally under ignored `qa/`. These tests do not claim Outlook Word/Gmail inbox certification.

References:
- https://help.brevo.com/hc/en-us/articles/4672127581074-Upload-an-HTML-file-to-design-your-emails-HTML-custom-code-editor
- https://developers.google.com/workspace/gmail/design/css
- https://www.litmus.com/blog/the-ultimate-guide-to-dark-mode-for-email-marketers

## Gmail iOS correction after Brevo test

The received screenshot showed inversion in the uncovered top of the event/footer background and around programme content. The programme and outer table had a trailing `background` shorthand that reset their protective gradient. Those resets are removed. The continuous texture now has a second, full-area navy gradient layer beneath it so untextured areas are protected too. Gmail auto-detected links inside event copy inherit the surrounding text style. The button uses `register-button-v1.png` rendered from the existing button text at 3x, with a transparent exterior, white pill and navy lettering.

`node scripts/verify-dark-mode.cjs` checks these specific background regressions and captures a synthetic inversion scenario. This is not a received Gmail message: a new test from Brevo is still required.

## Approved copy update

Replaced title, subtitle and introduction with the French text supplied by the user. Removed the entire Programme & informations block below the CTA. Registration URL remains simulated pending the final link.

## English assets (September 7, 2026)

Current image sources are `header-en.png`, `speakers-en.png` (combined Milei and ministers), `footer.png` and `register-button-en.png`. Replaced portrait/header sources and generated files were removed as requested, including their legacy encoded fragments. Current emails use versioned `header-en-v2.jpg`, `speakers-en-v2.jpg`, `register-button-en-v2.png` URLs; older sent emails using removed URLs can no longer fetch those images unless cached. The build clears dist before writing the current assets to avoid deploying obsolete copies.
