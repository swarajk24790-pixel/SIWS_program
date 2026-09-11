"""Vercel Function entrypoint for the UniPilot FastAPI application."""

from fastapi import Request
from backend.app.main import app


@app.middleware("http")
async def restore_api_path_after_vercel_rewrite(request: Request, call_next):
    """Restore the original API path forwarded by Vercel to this function.

    Vercel routes every `/api/*` request to this single Python function. The
    original suffix is carried in `__path`, allowing FastAPI's `/api/...`
    routers to continue receiving their normal paths and HTTP methods.
    """
    requested_path = request.query_params.get("__path")
    if requested_path:
        request.scope["path"] = f"/api/{requested_path.lstrip('/')}"
    return await call_next(request)
