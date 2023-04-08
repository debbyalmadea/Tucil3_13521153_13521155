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
  }
  
  export { Vertex };
  