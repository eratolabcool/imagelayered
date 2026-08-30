/**
 * Email template rendered as a plain HTML string.
 *
 * Intentionally does NOT use `@react-email/components` or `react-dom/server`.
 * `@react-email/components` re-exports `@react-email/render`, which imports
 * `prettier/standalone` and `prettier/plugins/html`; Next.js keeps `prettier`
 * external and the Cloudflare Worker runtime has no such module, so any page
 * that statically imported the email template would 500. Building the HTML
 * directly avoids that dependency entirely.
 */
export function renderVerifyEmailHtml({
  appName = 'our app',
  logoUrl,
  url,
}: {
  appName?: string;
  logoUrl?: string;
  url: string;
}): string {
  const esc = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const brandBlock =
    logoUrl || appName
      ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px">
        <tbody>
          <tr>
            ${
              logoUrl
                ? `<td width="40" style="vertical-align:middle"><img src="${esc(
                    logoUrl
                  )}" width="40" height="40" alt="${esc(
                    appName
                  )}" style="border-radius:10px;border:1px solid rgba(15,23,42,0.10);background-color:rgba(15,23,42,0.03)" /></td>`
                : ''
            }
            <td style="vertical-align:middle;padding-left:${logoUrl ? '10px' : '0'}">
              <span style="font-size:14px;line-height:18px;font-weight:600;color:#0f172a;letter-spacing:-0.01em">${esc(
                appName
              )}</span>
            </td>
          </tr>
        </tbody>
      </table>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify your email for ${esc(appName)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f9fc">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Verify your email for ${esc(
      appName
    )}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f9fc">
      <tbody>
        <tr>
          <td align="center" style="padding:32px 16px 40px">
            <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid rgba(15,23,42,0.08);box-shadow:0 20px 50px rgba(2,6,23,0.10),0 2px 8px rgba(2,6,23,0.05)">
              <tbody>
                <tr>
                  <td>
                    <div style="height:6px;border-radius:999px;margin-bottom:18px;background:linear-gradient(90deg,rgba(99,102,241,1) 0%,rgba(236,72,153,1) 55%,rgba(14,165,233,1) 100%)"></div>
                    ${brandBlock}
                    <h1 style="margin:0 0 10px;font-size:24px;line-height:30px;font-weight:700;letter-spacing:-0.01em;color:#0f172a">Verify your email</h1>
                    <p style="margin:0 0 18px;font-size:14px;line-height:22px;color:#334155">Click the button below to verify your email address and finish signing in to <strong>${esc(
                      appName
                    )}</strong>.</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0 14px;width:100%">
                      <tbody>
                        <tr>
                          <td align="center">
                            <a href="${esc(
                              url
                            )}" style="background-color:#111827;border-radius:12px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 18px;display:inline-block">Verify email</a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p style="margin:0 0 10px;font-size:12px;line-height:18px;color:#64748b;text-align:center">This link will expire in <strong>24 hours</strong>.</p>
                    <hr style="border:none;border-top:1px solid rgba(15,23,42,0.08);margin:18px 0" />
                    <p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#64748b">If the button doesn&apos;t work, copy and paste this link into your browser:</p>
                    <a href="${esc(
                      url
                    )}" style="font-size:12px;line-height:18px;color:#2563eb;word-break:break-all">${esc(
    url
  )}</a>
                    <p style="margin:18px 0 0;font-size:12px;line-height:18px;color:#94a3b8">If you didn&apos;t request this email, you can safely ignore it.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}
