"""
Branded Cafe 307 receipt emails via Gmail SMTP.

Sends a minimal, beautiful HTML receipt after a dish request payment.
Uses Python's built-in smtplib — no third-party email dependencies.

Required env vars:
  CAFE307_EMAIL_ADDRESS  — Gmail address to send from
  CAFE307_EMAIL_PASSWORD — Gmail app password (not regular password)
"""
import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

EMAIL_ADDRESS = os.environ.get("CAFE307_EMAIL_ADDRESS")
EMAIL_PASSWORD = os.environ.get("CAFE307_EMAIL_PASSWORD")


def _build_receipt_html(dish_name: str, amount_cents: int, is_custom: bool, custom_note: str | None) -> str:
    """Build a branded HTML receipt matching Cafe 307's pastel aesthetic."""
    amount_str = f"${amount_cents / 100:.2f}"
    request_type = "Custom Request" if is_custom else "Chef's Choice"

    custom_section = ""
    if is_custom and custom_note:
        # Detect if the note is a URL
        note_display = custom_note
        if custom_note.startswith("http://") or custom_note.startswith("https://"):
            note_display = f'<a href="{custom_note}" style="color:#B47B8A;text-decoration:underline;">{custom_note}</a>'
        custom_section = f"""
        <tr>
          <td style="padding:12px 24px;font-family:'Georgia',serif;font-size:13px;color:#9B8B7A;letter-spacing:0.5px;">
            Your request
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px;font-family:'Georgia',serif;font-size:14px;color:#4A3728;font-style:italic;line-height:1.6;">
            {note_display}
          </td>
        </tr>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#FDF6F8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
        <tr>
          <td align="center">
            <table width="420" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(232,152,171,0.12);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#F4B4C3,#E8E0F0);padding:32px 24px 28px;text-align:center;">
                  <div style="font-size:20px;margin-bottom:8px;">🌟</div>
                  <div style="font-family:'Georgia',serif;font-size:18px;color:#4A3728;letter-spacing:3px;font-weight:300;">
                    Cafe 307
                  </div>
                  <div style="font-family:'Georgia',serif;font-size:9px;color:#4A3728;opacity:0.8;letter-spacing:2px;margin-top:6px;">
                    私人晩ごはん
                  </div>
                </td>
              </tr>
              <!-- Preview text — shows in email inbox preview -->
              <tr>
                <td style="padding:24px 24px 4px;text-align:center;">
                  <div style="font-family:'Georgia',serif;font-size:13px;color:#4A3728;font-style:italic;">
                    You made a wish! ✨
                  </div>
                </td>
              </tr>
              <!-- Receipt title -->
              <tr>
                <td style="padding:12px 24px 8px;text-align:center;">
                  <div style="font-family:'Georgia',serif;font-size:11px;color:#9B8B7A;letter-spacing:3px;text-transform:uppercase;">
                    Receipt
                  </div>
                </td>
              </tr>
              <!-- Dish name -->
              <tr>
                <td style="padding:8px 24px;text-align:center;">
                  <div style="font-family:'Georgia',serif;font-size:20px;color:#4A3728;font-weight:300;letter-spacing:1.5px;font-style:italic;">
                    {dish_name}
                  </div>
                </td>
              </tr>
              <!-- Divider -->
              <tr>
                <td style="padding:16px 24px;">
                  <div style="height:1px;background:linear-gradient(to right,transparent,rgba(232,152,171,0.3),transparent);"></div>
                </td>
              </tr>
              <!-- Amount + type -->
              <tr>
                <td style="padding:0 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:'Georgia',serif;font-size:13px;color:#9B8B7A;letter-spacing:0.5px;padding-right:12px;">
                        {request_type}
                      </td>
                      <td align="right" style="font-family:'Georgia',serif;font-size:16px;color:#4A3728;font-weight:300;letter-spacing:1px;">
                        {amount_str}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Custom note (if $2 custom request) -->
              {custom_section}
              <!-- Divider -->
              <tr>
                <td style="padding:16px 24px;">
                  <div style="height:1px;background:linear-gradient(to right,transparent,rgba(232,152,171,0.3),transparent);"></div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:16px 24px 28px;text-align:center;">
                  <div style="font-family:'Georgia',serif;font-size:11px;color:#9B8B7A;font-style:italic;line-height:1.8;">
                    Your wish is very important to us. Please hold momentarily.<br>
                    Visit <a href="https://cafe307.com" style="color:#B47B8A;text-decoration:underline;">cafe307.com</a> to see the latest menu — your wish might be granted ✨
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def send_receipt(
    to_email: str,
    dish_name: str,
    amount_cents: int,
    is_custom: bool = False,
    custom_note: str | None = None,
) -> bool:
    """
    Send a branded receipt email. Returns True on success, False on failure.
    Fails silently if email credentials aren't configured — payment still counts.
    """
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        logger.warning("Receipt email skipped: CAFE307_EMAIL_ADDRESS or CAFE307_EMAIL_PASSWORD not set")
        return False
    if not to_email:
        logger.warning("Receipt email skipped: no recipient email provided")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Cafe 307 — {dish_name} ✨"
        msg["From"] = f"Cafe 307 <{EMAIL_ADDRESS}>"
        msg["To"] = to_email

        html = _build_receipt_html(dish_name, amount_cents, is_custom, custom_note)
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(msg)

        logger.info(f"Receipt email sent to {to_email} for '{dish_name}'")
        return True
    except Exception:
        logger.exception(f"Failed to send receipt email to {to_email}")
        return False
