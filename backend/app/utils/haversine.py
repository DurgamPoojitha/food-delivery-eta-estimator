"""
utils/haversine.py
==================
Purpose:
    Computes the great-circle distance (in kilometres) between two points
    on the Earth's surface given their latitude and longitude in decimal degrees.

Design Rationale:
    - Pure function (no side effects, no I/O) → easy to unit-test in isolation.
    - Lives in `utils/` because it is a mathematical primitive, not business logic.
    - Any service that needs distance can import this without pulling in any
      business-layer dependencies (Dependency Inversion Principle).

Formula Reference:
    Haversine formula — accounts for the spherical shape of the Earth.
    Error margin: < 0.5% for distances under 500 km (sufficient for food delivery).
"""

import math


# Mean radius of Earth in kilometres (WGS-84 standard)
EARTH_RADIUS_KM: float = 6371.0


def haversine(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Calculate the straight-line (great-circle) distance between two GPS coordinates.

    Args:
        lat1: Latitude of point 1 in decimal degrees  (e.g. 51.5074 for London)
        lon1: Longitude of point 1 in decimal degrees (e.g. -0.1278 for London)
        lat2: Latitude of point 2 in decimal degrees
        lon2: Longitude of point 2 in decimal degrees

    Returns:
        Distance in kilometres, rounded to 4 decimal places.

    Example:
        >>> haversine(51.5074, -0.1278, 51.5155, -0.0922)
        2.6318   # ~2.6 km between two London points
    """
    # --- Step 1: Convert degrees → radians ---
    # All trig functions in Python's `math` module work in radians.
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    lon1_r = math.radians(lon1)
    lon2_r = math.radians(lon2)

    # --- Step 2: Compute deltas ---
    delta_lat = lat2_r - lat1_r  # Δφ
    delta_lon = lon2_r - lon1_r  # Δλ

    # --- Step 3: Haversine formula ---
    # a = sin²(Δφ/2) + cos(φ1)·cos(φ2)·sin²(Δλ/2)
    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(delta_lon / 2) ** 2
    )

    # c = 2·atan2(√a, √(1−a))   ← angular distance in radians
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    # --- Step 4: Arc length = radius × central angle ---
    distance_km = EARTH_RADIUS_KM * c

    return round(distance_km, 4)
