import math

EARTH_RADIUS_KM: float = 6371.0

def haversine(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    
    lat1_r = math.radians(lat1)
    lat2_r = math.radians(lat2)
    lon1_r = math.radians(lon1)
    lon2_r = math.radians(lon2)

    delta_lat = lat2_r - lat1_r
    delta_lon = lon2_r - lon1_r

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance_km = EARTH_RADIUS_KM * c

    return round(distance_km, 4)
