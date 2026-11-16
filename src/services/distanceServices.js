// =====================================================
// WAAHEEN MARKET LOCATION
// =====================================================

export const WAAHEEN_LOCATION = {
  latitude: 9.5624,
  longitude: 44.0656,
};

// =====================================================
// CALCULATE DISTANCE USING HAVERSINE
// =====================================================

export const calculateDistanceKm = (
  latitude,
  longitude
) => {
  const lat1 = Number(WAAHEEN_LOCATION.latitude);
  const lon1 = Number(WAAHEEN_LOCATION.longitude);

  const lat2 = Number(latitude);
  const lon2 = Number(longitude);

  if (
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    throw new Error("Invalid customer location");
  }

  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  const distance =
    earthRadiusKm * c;

  return Number(distance.toFixed(2));
};