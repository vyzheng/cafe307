"""
Shared auth dependencies for role-based route protection.

Cafe 307 uses a simple code-based auth system: each user has a
"reservation code" (like "vivian" or "vlad") sent via the
X-Reservation-Code HTTP header. Routes declare which role they
require by adding a FastAPI dependency like Depends(require_vivian).
"""
from typing import Optional

from fastapi import Header, HTTPException


# ---- Factory pattern for role dependencies ----
#
# Instead of writing a separate function for each role, we use a
# factory: _require_role("vivian") returns a new function that
# checks whether the incoming header matches "vivian". This keeps
# things DRY -- adding a new role is a one-liner at the bottom.

def _require_role(role: str):
    """Return a FastAPI dependency that checks X-Reservation-Code matches `role`."""

    # FastAPI inspects this function's signature to know which
    # headers/query params to inject. The Header() default tells
    # FastAPI: "read the X-Reservation-Code header and pass it in
    # as the `x_reservation_code` parameter." The `alias` maps
    # the Python snake_case name to the actual HTTP header name.
    def dependency(
        x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
    ):
        if (x_reservation_code or "").strip().lower() != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return role

    # FastAPI uses __name__ for OpenAPI docs and error messages.
    # Without this, every role dependency would show up as
    # "dependency" in the docs. Setting it to "require_vivian" etc.
    # makes debugging and generated docs much clearer.
    dependency.__name__ = f"require_{role}"
    return dependency


# Pre-built dependencies used across route files:
#   require_vivian -- chef/admin actions (edit menus, chef notes)
#   require_vlad   -- VIP guest actions (write VIP reviews)
# Usage in routes: _: str = Depends(require_vivian)
require_vivian = _require_role("vivian")
require_vlad = _require_role("vlad")
