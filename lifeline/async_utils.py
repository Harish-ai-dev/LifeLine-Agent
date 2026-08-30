"""
Async utility — safely run a coroutine from synchronous code,
even when called inside an already-running event loop (e.g. FastAPI/uvicorn).

Problem:
    asyncio.get_event_loop().run_until_complete(coro)
    raises RuntimeError("This event loop is already running") inside FastAPI.

Solution:
    Run the coroutine in a brand-new thread that creates its own event loop.
    This is safe, thread-local, and avoids nest_asyncio patching.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
from typing import Any, Coroutine, TypeVar

T = TypeVar("T")


def run_async(coro: Coroutine[Any, Any, T]) -> T:
    """
    Execute *coro* synchronously and return its result.

    Works correctly whether called from:
      - a plain synchronous context (no running loop)
      - inside an async context / FastAPI endpoint (loop already running)
    """
    try:
        asyncio.get_running_loop()          # raises RuntimeError if none
        # A loop IS running — spin up a thread with its own fresh loop
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(_run_in_new_loop, coro)
            return future.result()
    except RuntimeError:
        # No loop running — safe to call asyncio.run() directly
        return asyncio.run(coro)


def _run_in_new_loop(coro: Coroutine) -> Any:
    """Entry point for the worker thread: creates a fresh event loop."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()
