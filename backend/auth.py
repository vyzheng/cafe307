"""Shared auth dependencies for role-based route protection."""
from typing import Optional

from fastapi import Header, HTTPException


def _require_role(role: str):
    """Return a FastAPI dependency that checks X-Reservation-Code matches `role`."""
    def dependency(
        x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
    ):
        if (x_reservation_code or "").strip().lower() != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return role
    dependency.__name__ = f"require_{role}"
    return dependency


require_vivian = _require_role("vivian")
require_vlad = _require_role("vlad")
