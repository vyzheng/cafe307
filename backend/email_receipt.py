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
    """Build a branded HTML receipt — clean, readable, mobile-first."""
    from datetime import datetime

    amount_str = f"${amount_cents / 100:.2f}"
    request_type = "Custom Request" if is_custom else "Chef's Choice"
    date_str = datetime.now().strftime("%b %d, %Y")

    custom_section = ""
    if is_custom and custom_note:
        note_display = custom_note
        if custom_note.startswith("http://") or custom_note.startswith("https://"):
            note_display = f'<a href="{custom_note}" style="color:#B47B8A;text-decoration:underline;">{custom_note}</a>'
        custom_section = f"""
                  <div style="font-family:Georgia,serif;font-size:14px;color:#3A2A1A;font-style:italic;margin-top:6px;">"{note_display}"</div>"""

    return f"""<!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#FDFCFA;">
      <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
        You made a wish! Visit cafe307.com to see the latest menu ✨
      </div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:20px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
              <!-- Brand -->
              <tr>
                <td style="padding:36px 24px 0;text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:16px;color:#3A2A1A;letter-spacing:4px;">Cafe 307</div>
                  <div style="width:40px;height:2px;background:linear-gradient(to right,#F4B4C3,#DCC8E8);margin:14px auto 0;"></div>
                </td>
              </tr>
              <!-- CTA -->
              <tr>
                <td style="padding:28px 28px 24px;text-align:center;">
                  <div style="font-family:Georgia,serif;font-size:16px;color:#3A2A1A;line-height:1.8;">
                    You made a wish! ✨
                  </div>
                  <div style="font-family:Georgia,serif;font-size:14px;color:#6B5D4F;line-height:1.8;margin-top:8px;">
                    Visit <a href="https://cafe307.com" style="color:#B47B8A;text-decoration:underline;">cafe307.com</a> to see the latest menu — your wish might be granted this week!
                  </div>
                </td>
              </tr>
              <!-- Divider -->
              <tr>
                <td style="padding:0 24px;">
                  <div style="height:1px;background:#EEEAE4;"></div>
                </td>
              </tr>
              <!-- Details: date, order, type, note -->
              <tr>
                <td style="text-align:center;padding:20px 24px 8px;">
                  <div style="font-family:Georgia,serif;font-size:11px;color:#B0A898;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">{date_str}</div>
                  <div style="font-family:Georgia,serif;font-size:21px;color:#3A2A1A;font-style:italic;margin-bottom:16px;">{dish_name}</div>
                  <div style="font-family:Georgia,serif;font-size:12px;color:#B0A898;margin-bottom:6px;">{request_type}</div>{custom_section}
                </td>
              </tr>
              <!-- Total chip -->
              <tr>
                <td align="center" style="padding:12px 24px 28px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#FAF5F0;border-radius:8px;padding:10px 24px;">
                        <span style="font-family:Georgia,serif;font-size:13px;color:#9B8B7A;letter-spacing:1px;">Total</span>
                        <span style="font-family:Georgia,serif;font-size:24px;color:#3A2A1A;padding-left:12px;letter-spacing:1px;">{amount_str}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>"""


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
        msg["Subject"] = f"Your receipt — {dish_name} ✨"
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
