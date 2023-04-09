/**
 * 
 * @param degree 
 * @returns degree in radian
 */
export function toRad(degree: number) {
    var pi = Math.PI;
    return degree * (pi / 180);
}

/**
 * 
 * @param c1 coordinate of the first point
 * @param c2 coordinate of the second point
 * @returns haversine distance between c1 and c2 in km
 * 
 * Haversine distance is the angular distance between two points on the surface of a sphere
 * The first coordinate of each point is assumed to be the latitude, 
 * the second is the longitude, given in radians.
 */
export function haversineDistance(c1: {lat: number, lng: number}, c2: {lat: number, lng: number}): number {
  const R = 6371; // earth's radius

  const c1Rad = { lat: toRad(c1.lat), lng: toRad(c1.lng) };
  const c2Rad = { lat: toRad(c2.lat), lng: toRad(c2.lng) };

  const dlat = c1Rad.lat - c2Rad.lat;
  const dlng = c1Rad.lng - c2Rad.lng;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(c1Rad.lat) * Math.cos(c2Rad.lat) * Math.pow(Math.sin(dlng / 2), 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // distance
  let d = R * c;

  return d;
}