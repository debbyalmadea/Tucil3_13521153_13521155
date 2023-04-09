export function toRad(degree: number) {
    var pi = Math.PI;
    return degree * (pi / 180);
  }

  export function haversineDistance(c1: {lat: number, lng: number}, c2: {lat: number, lng: number}): number {
    const R = 6371;
    const c1Rad = { lat: toRad(c1.lat), lng: toRad(c1.lng) };
    const c2Rad = { lat: toRad(c2.lat), lng: toRad(c2.lng) };
  
    const dlat = c1Rad.lat - c2Rad.lat;
    const dlng = c1Rad.lng - c2Rad.lng;
    let a =
      Math.pow(Math.sin(dlat / 2), 2) +
      Math.cos(c1Rad.lat) * Math.cos(c2Rad.lat) * Math.pow(Math.sin(dlng / 2), 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }