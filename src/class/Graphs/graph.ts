import { Vertex } from "./vertex";

class Graph {
  private _graphObj: Map<string, Vertex> = new Map<string, Vertex>();
  private _graph: Map<string, string[]> = new Map<string, string[]>();
  private _maxX: number | null = null
  private _maxY: number | null = null
  private _minX: number | null = null
  private _minY: number | null = null

  public get maxX(): number | null {return this._maxX}
  public get maxY(): number | null {return this._maxY}
  public get minX(): number | null {return this._minX}
  public get minY(): number | null {return this._minY}


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
  public addVertex(vertex: Vertex): void {
    if (!(vertex.name in this._graph)) {
      this._graphObj.set(vertex.name, vertex)
      this._graph.set(vertex.name, [])
      if (this._maxX == null && this._maxY == null && this._minX == null && this._minY == null) {
        this._maxX = vertex.px
        this._maxY = vertex.py
      } else {
        if (this._maxX != null && vertex.px > this._maxX) this._maxX = vertex.px;
        if (this._minX != null && vertex.px < this._minX) this._minX = vertex.px;
        if (this._maxY != null && vertex.py > this._maxY) this._maxY = vertex.py;
        if (this._minY != null && vertex.py < this._minY) this._minY = vertex.py;
      }
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
