"""
Medicine, Blood Units, & Equipment Inventory routes per docs/09-parallel-build-contract.md#53-hospital-operations--patient-management.
"""

import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from lifeline.schemas import (
    InventoryItemRecord,
    InventoryUpdateRequest,
    InventoryResponse,
    ErrorResponse,
)
from lifeline.tools.data_store import get_data_store

router = APIRouter()


@router.get(
    "",
    response_model=InventoryResponse,
    responses={
        200: {"description": "List of inventory items"},
    },
)
async def list_inventory(
    hospital_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    low_stock_only: Optional[bool] = Query(False),
):
    """
    Query blood bank units, medicines, and medical equipment inventory with low-stock alerts.
    """
    store = get_data_store()
    all_inventory = await store.async_list_all("inventory")

    filtered = []
    for item in all_inventory:
        if hospital_id and item.get("hospital_id") != hospital_id:
            continue
        if category and category.lower() != "all" and item.get("category", "").lower() != category.lower():
            continue

        # Dynamic low stock calculation
        current_stock = int(item.get("current_stock", 0))
        min_thresh = int(item.get("minimum_threshold", 0))
        is_low = current_stock <= min_thresh
        item["is_low_stock"] = is_low

        if low_stock_only and not is_low:
            continue

        item["id"] = item.get("_id") or item.get("id")
        filtered.append(InventoryItemRecord(**item))

    return InventoryResponse(inventory=filtered)


@router.patch(
    "/{id}",
    response_model=InventoryItemRecord,
    responses={
        404: {"model": ErrorResponse, "description": "Inventory item not found"},
    },
)
async def update_inventory(id: str, payload: InventoryUpdateRequest):
    """
    Update stock levels or minimum threshold for an inventory item.
    """
    store = get_data_store()
    item = await store.async_get("inventory", id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory item with ID '{id}' not found",
        )

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    updates["last_updated"] = now_iso

    # Recalculate low stock flag
    new_stock = updates.get("current_stock", item.get("current_stock", 0))
    new_thresh = updates.get("minimum_threshold", item.get("minimum_threshold", 0))
    updates["is_low_stock"] = int(new_stock) <= int(new_thresh)

    updated = await store.async_update("inventory", id, updates, actor="inventory_manager")
    if updated:
        item = updated

    item["id"] = item.get("_id") or item.get("id") or id
    return InventoryItemRecord(**item)
