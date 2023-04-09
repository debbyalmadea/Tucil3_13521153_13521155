class Vertex {
    constructor(public name: string, public px: number, public py: number) {}
  
    /**
     * 
     * @param vertex other vertex
     * @returns distance of this with other vertex
     */
    public distanceWith(vertex: Vertex): number {
      const dx = this.px - vertex.px;
      const dy = this.py - vertex.py;
      return Math.sqrt(dx ** 2 + dy ** 2);
    }

    public isEqual(vertex: Vertex): Boolean {
      return this.name == vertex.name
    }

    private toRad(degree: number) {
      var pi = Math.PI;
      return degree * (pi / 180);
    }
    public haversineDistanceWith(vertex: Vertex): number {
      const R = 6371;
      const c1Rad = { lat: this.toRad(this.px), lng: this.toRad(this.py) };
      const c2Rad = { lat: this.toRad(vertex.px), lng: this.toRad(vertex.py) };
    
      const dlat = c1Rad.lat - c2Rad.lat;
      const dlng = c1Rad.lng - c2Rad.lng;
      let a =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(c1Rad.lat) * Math.cos(c2Rad.lat) * Math.pow(Math.sin(dlng / 2), 2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c;
      return d;
    }
  }
  
  export { Vertex };
  