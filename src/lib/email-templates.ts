/**
 * Email templates for authentication
 * Branded templates for magic link emails
 */

interface MagicLinkEmailParams {
  url: string
  host: string
}

/**
 * Generate HTML template for magic link email
 */
export function generateMagicLinkEmail({ url, host }: MagicLinkEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Momentum</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Logo/Header -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #ffffff; letter-spacing: -0.5px;">
                Momentum
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #111111; border: 1px solid #222222; border-radius: 8px; padding: 40px;">
              
              <!-- Title -->
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 400; color: #ffffff;">
                Sign in to Momentum
              </h2>
              
              <!-- Description -->
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #a0a0a0;">
                Click the button below to securely sign in to your account. This link will expire in 10 minutes.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="border-collapse: collapse; margin: 0 0 24px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #ffffff;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 500; color: #000000; text-decoration: none; border-radius: 6px;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin: 0; font-size: 13px; color: #555555; word-break: break-all;">
                ${url}
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0 0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;">
                This link will expire in 10 minutes and can only be used once.
              </p>
              <p style="margin: 0; font-size: 13px; color: #666666;">
                If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          
          <!-- Branding Footer -->
          <tr>
            <td style="padding: 32px 0 0 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #444444;">
                © ${new Date().getFullYear()} Momentum. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for email clients that don't support HTML
 */
export function generateMagicLinkText({ url, host }: MagicLinkEmailParams): string {
  return `
Sign in to Momentum

Click the link below to sign in to your account:

${url}

This link will expire in 10 minutes and can only be used once.

If you didn't request this email, you can safely ignore it.

© ${new Date().getFullYear()} Momentum. All rights reserved.
  `.trim()
}