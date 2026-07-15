"""
routers/estimate.py
===================
Purpose:
    HTTP routing for the ETA estimation endpoint.
    This module owns only HTTP concerns — it contains ZERO business logic.

Thin Router Pattern:
    - Receives HTTP request → delegates to service → returns HTTP response.
    - If the route handler is more than 10 lines, logic belongs in the service.

OpenAPI Documentation:
    - responses= dict documents all possible HTTP responses in Swagger UI,
      giving API consumers a complete contract without reading source code.
    - The request body example comes from EstimateRequest.model_config.
    - Tags group related endpoints together in the Swagger sidebar.

Why no prefix here?
    The prefix ("/api") is set in main.py via app.include_router(prefix=...).
    The router itself doesn't know (or care) where it's mounted.
    This follows the Open/Closed Principle: change the mount path without
    modifying the router module.
"""

import logging

from fastapi import APIRouter

from app.core.logging_config import get_logger
from app.models.estimate import ErrorResponse, EstimateRequest, EstimateResponse
from app.services.eta_service import estimate_eta

logger = get_logger(__name__)

router = APIRouter(tags=["ETA Estimation"])


@router.post(
    "/estimate",
    response_model=EstimateResponse,
    summary="Estimate food delivery ETA",
    description=(
        "Calculates the estimated delivery arrival time (ETA) for a food order.\n\n"
        "**Algorithm:**\n"
        "1. Compute straight-line distance using the **Haversine formula**\n"
        "2. Apply average speed based on traffic level (Low=40, Medium=25, High=15 km/h)\n"
        "3. `total_eta = travel_time + prep_time`\n\n"
        "**Delivery Status Thresholds:**\n"
        "- ⚡ Fast Delivery — ETA < 20 minutes\n"
        "- 🕐 Moderate — ETA 20–40 minutes\n"
        "- 🐢 Delayed — ETA > 40 minutes"
    ),
    response_description="Successful ETA estimation with distance, times, and delivery status",
    responses={
        200: {
            "description": "ETA calculated successfully",
            "model": EstimateResponse,
        },
        422: {
            "description": "Request validation failed — check field constraints",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code":    "VALIDATION_ERROR",
                            "message": "Request validation failed. Please check the highlighted fields.",
                            "details": [
                                {
                                    "field":   "restaurant_lat",
                                    "message": "Input should be less than or equal to 90",
                                    "type":    "less_than_equal",
                                }
                            ],
                        }
                    }
                }
            },
        },
        500: {
            "description": "Internal server error",
            "model": ErrorResponse,
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code":    "INTERNAL_ERROR",
                            "message": "An unexpected error occurred. Please try again later.",
                        }
                    }
                }
            },
        },
    },
)
async def estimate_delivery_eta(request: EstimateRequest) -> EstimateResponse:
    """
    POST /api/estimate

    FastAPI validates the JSON body against EstimateRequest BEFORE this
    function is called — invalid input auto-returns 422.

    This handler is intentionally thin: it logs the incoming request
    at DEBUG level, then delegates entirely to the service layer.
    """
    logger.debug(
        "POST /api/estimate | restaurant=%r | traffic=%s",
        request.restaurant_name,
        request.traffic.value,
    )
    return estimate_eta(request)
