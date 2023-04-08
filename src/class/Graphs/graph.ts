import { Vertex } from "./vertex";

class Graph {
  private _graphObj: Map<string, Vertex> = new Map<string, Vertex>();
  private _graph: Map<string, string[]> = new Map<string, string[]>();

  /**
   * 
   * @returns keys of graph, or in this case the vertex's name
   */
  public getGraphKeys(): string[] {
    return Array.from(this._graph.keys())
  }

  /**
   * 
   * @param vertexName 
   * @returns vertex with name equals to vertexName
   */
  public getVertexObj(vertexName: string): Vertex | null {
    let vertexObj = this._graphObj.get(vertexName)
    if (vertexObj != undefined) {
      return vertexObj;
    } else {
      return null;
    }
  } 

  /**
   * 
   * @param vertexName 
   * @returns all adjency vertex of vertex with name equals to vertexName
   */
  public getAdjVertexes(vertexName: string) : string[] {
    let adjVertexes = this._graph.get(vertexName)
    if (adjVertexes != undefined) {
      return adjVertexes;
    } else {
      return [];
    }
  }

  /**
   * 
   * @param vertex 
   */
  public addVertex(vertex: Vertex): void {
    if (!(vertex.name in this._graph)) {
      this._graphObj.set(vertex.name, vertex)
      this._graph.set(vertex.name, [])
    }
  }

  /**
   * 
   * @param vertex1 first vertex
   * @param vertex2 second vertex
   */
  public addEdge(vertex1: Vertex, vertex2: Vertex): void {
    // check if vertex1 exists
    if (this._graph.get(vertex1.name) == undefined) {
      this.addVertex(vertex1);
    }

    // check if vertex2 exists
    if (this._graph.get(vertex2.name) == undefined) {
      this.addVertex(vertex2);
    }

    if (!this._graph.get(vertex1.name)!.includes(vertex2.name)) {
      this._graph.get(vertex1.name)!.push(vertex2.name);
    }

    if (!this._graph.get(vertex2.name)!.includes(vertex1.name)) {
      this._graph.get(vertex2.name)!.push(vertex1.name);
    }
  }

  /**
   * 
   * @returns string equivalent of graphs, shows information from graphs
   * format:
   * VertexName: VertexAdjName - VertexAdjName
   * etc..
   */
  public toString(): string {
    let result = '';
    const vertexes = Array.from(this._graph.keys())
    for (const vertex of vertexes) {
      result += vertex + ': ';
      for (const adjVertex of this._graph.get(vertex)!) {
        result += adjVertex + ', ';
      }

      result += '\n';
    }

    return result;
  }
}

export { Graph };
