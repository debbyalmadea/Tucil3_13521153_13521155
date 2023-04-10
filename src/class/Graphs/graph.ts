import { Vertex } from "./vertex";

interface AdjVertexInterface {
  vertex: Vertex;
  weight: number;
}

class Graph {
  private _graph: Map<Vertex, AdjVertexInterface[]> = new Map<Vertex, AdjVertexInterface[]>();

  /**
   * 
   * @returns array of vertex
   */
  public getVertexes(): Vertex[] {
    return Array.from(this._graph.keys())
  }

  /**
   * 
   * @param vertexName 
   * @returns all adjency vertex of vertex
   */
  public getAdjVertexes(vertex: Vertex) : AdjVertexInterface[]{
    let adjVertexes =  this._graph.get(vertex)
    if (adjVertexes == undefined) {
      return [];
    } else {
      return adjVertexes;
    }
  }

  public isEmpty() {
    return this._graph.size == 0;
  }

  public isNameExist(name: string) {
    let found = false;
    Array.from(this._graph.keys()).forEach((vertex) => {
      if (vertex.name == name) {
        console.log(vertex.name, name)
        found = true;
      }
    })

    return found;
  }

  public isEdgeExist(vertex: Vertex, adjVertex: Vertex) {
    let id = this.getAdjVertexes(vertex).findIndex((adj) => adj.vertex.isEqual(adjVertex))
    return id > -1;
  }

  public getEdgeWeight(from: Vertex, to: Vertex) {
    let id = this.getAdjVertexes(from).findIndex((adj) => adj.vertex.isEqual(to))
    if (id == -1) {
      return -1;
    } else {
      return this.getAdjVertexes(from)[id].weight
    }
  }

  /**
   * 
   * @param vertex 
   * @returns 1 if successfully added, 0 if failed (duplicate name)
   */
  public addVertex(vertex: Vertex): number {
    if (this._graph.get(vertex) == undefined && !this.isNameExist(vertex.name)) {
      this._graph.set(vertex, [])
      return 1;
    }

    return 0;
  }

  /**
   * 
   * @param vertex1 first vertex
   * @param vertex2 second vertex
   */
  public addEdge(from: Vertex, to: Vertex, weight?: number): void {
    // check if from exists
    if (this._graph.get(from) == undefined) {
      this.addVertex(from);
    }

    // check if to exists
    if (this._graph.get(to) == undefined) {
      this.addVertex(to);
    }

    if (!this.isEdgeExist(from, to)) {
      this._graph.get(from)!.push({vertex: to, weight: weight == undefined ? from.distanceWith(to) : weight});
    }
  }

  /**
   * 
   * @returns string equivalent of graphs, shows information from graphs
   * format:
   * VertexName: VertexAdjName, VertexAdjName, ..
   * etc..
   */
  public toString(): string {
    let result = '';
    const vertexes = Array.from(this._graph.keys())
    for (const vertex of vertexes) {
      result += vertex.name + ': ';
      for (const adjVertex of this._graph.get(vertex)!) {
        result += adjVertex.vertex.name + ', ';
      }

      result += '\n';
    }

    return result;
  }
}

export { Graph };
