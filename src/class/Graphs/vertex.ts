import { haversineDistance } from "@/lib/operation";

class Vertex {
    private static vertexCount = 0;
    public id: number;
    constructor(public name: string, public px: number, public py: number) {
      Vertex.vertexCount += 1;
      this.id = Vertex.vertexCount;
    }
  
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

    /**
     * 
     * @param vertex 
     * @returns true if this name equals to vertex name
     */
    public isEqual(vertex: Vertex): Boolean {
      return this.name == vertex.name
    }

    /**
     * 
     * @param vertex 
     * @returns haversine distance between this and vertex in km
     */
    public haversineDistanceWith(vertex: Vertex): number {
      return haversineDistance({lat: this.px, lng: this.py}, {lat: vertex.px, lng: vertex.py})
    }
  }
  
  export { Vertex };
  