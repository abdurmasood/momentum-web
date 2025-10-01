/**
 * Email templates for authentication
 * Branded templates for magic link emails
 */

/**
 * Validates and sanitizes URLs for use in email templates
 *
 * Security measures:
 * - Validates URL format using native URL parser
 * - Enforces protocol whitelist (http/https only)
 * - Prevents protocol injection attacks (javascript:, data:, etc.)
 * - Prevents malformed URLs from being used
 *
 * @param url - The URL to validate
 * @returns The validated URL string
 * @throws Error if URL is invalid or uses non-HTTP(S) protocol
 */
function validateEmailUrl(url: string): string {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch (error) {
    throw new Error(`Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Whitelist only HTTP and HTTPS protocols
  const allowedProtocols = ['http:', 'https:']
  if (!allowedProtocols.includes(parsedUrl.protocol)) {
    throw new Error(
      `Invalid URL protocol: ${parsedUrl.protocol}. Only HTTP and HTTPS are allowed in email links.`
    )
  }

  return url
}

/**
 * Escapes HTML special characters to prevent injection
 *
 * Converts potentially dangerous characters to their HTML entity equivalents:
 * - < becomes &lt;
 * - > becomes &gt;
 * - & becomes &amp;
 * - " becomes &quot;
 * - ' becomes &#39;
 *
 * @param text - The text to escape
 * @returns The escaped text safe for HTML display
 */
function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[<>&"']/g, (char) => htmlEscapeMap[char] || char)
}

interface MagicLinkEmailParams {
  url: string
}

/**
 * Generate HTML template for magic link email
 *
 * Security: Validates URL to prevent injection attacks before rendering
 */
export function generateMagicLinkEmail({ url }: MagicLinkEmailParams): string {
  // Validate URL to prevent protocol injection and malformed URLs
  const validatedUrl = validateEmailUrl(url)
  // Escape URL for safe display in HTML text context
  const escapedUrl = escapeHtml(validatedUrl)

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
                    <a href="${validatedUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 500; color: #000000; text-decoration: none; border-radius: 6px;">
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
                ${escapedUrl}
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
 *
 * Security: Validates URL to prevent injection attacks before rendering
 */
export function generateMagicLinkText({ url }: MagicLinkEmailParams): string {
  // Validate URL to prevent protocol injection and malformed URLs
  const validatedUrl = validateEmailUrl(url)

  return `
Sign in to Momentum

Click the link below to sign in to your account:

${validatedUrl}

This link will expire in 10 minutes and can only be used once.

If you didn't request this email, you can safely ignore it.

© ${new Date().getFullYear()} Momentum. All rights reserved.
  `.trim()
}