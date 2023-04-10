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
   * @returns array of vertex
   */
  public getVertexes(): Vertex[] {
    let result: Vertex[] = []
    const vertexesKey = Array.from(this._graphObj.keys())
    vertexesKey.forEach((key) => {
      result.push(this._graphObj.get(key)!)
    })
    return result
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
  public getAdjVertexes(vertexName: string) : Vertex[] {
    let adjVertexesName = this._graph.get(vertexName)
    let adjVertexes: Vertex[] = []
    if (adjVertexesName != undefined) {
      adjVertexesName.forEach((adjVertexName) => {
        let vertex = this._graphObj.get(adjVertexName)
        adjVertexes.push(vertex!)
      })
    } 
    return adjVertexes
  }

  public isEmpty() {
    return this._graph.size == 0;
  }

  /**
   * 
   * @param vertex 
   */
  public addVertex(vertex: Vertex): number {
    if (this.getVertexObj(vertex.name) == null) {
      this._graphObj.set(vertex.name, vertex)
      this._graph.set(vertex.name, [])

      return 1;
    }

    return 0;
  }

  /**
   * 
   * @param vertex1 first vertex
   * @param vertex2 second vertex
   */
  public addEdge(from: Vertex, to: Vertex): void {
    // check if from exists
    if (this._graph.get(from.name) == undefined) {
      this.addVertex(from);
    }

    // check if to exists
    if (this._graph.get(to.name) == undefined) {
      this.addVertex(to);
    }

    if (!this._graph.get(from.name)!.includes(to.name)) {
      this._graph.get(from.name)!.push(to.name);
    }

    // if (!this._graph.get(to.name)!.includes(from.name)) {
    //   this._graph.get(to.name)!.push(from.name);
    // }
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
