import { Graph } from "../Graphs/graph";
import { Vertex } from "../Graphs/vertex";

interface CostFunc {
  (vertex: Vertex, lastVertex: Vertex | null): number;
}

class Path {
  private _path: string[] = [];
  private _cost: number = 0;
  private _distance: number= 0;

  constructor(private graph: Graph, private costFunc: CostFunc) {}

  public get path(): string[] {
    return this._path;
  }

  public get cost(): number {
    return this._cost;
  }

  public get distance(): number {
    return this._distance
  }

  public get lastVertex(): string {
    return this._path[this._path.length - 1];
  }

  public add(vertexName: string): void {
    const vertexObj = this.graph.getVertexObj(vertexName);
    if (vertexObj != null) {
        let lastVertexObj: Vertex | null = null;
        if (this._path.length > 0) {
            lastVertexObj = this.graph.getVertexObj(this.lastVertex);
            this._distance += vertexObj.distanceWith(lastVertexObj!);
        }
        this._cost += this.costFunc(vertexObj, lastVertexObj);
        this._path.push(vertexName);
    }
  }

  public copy(): Path {
    const copyPath = new Path(this.graph, this.costFunc);
    copyPath._cost = this.cost;
    copyPath._distance = this.distance;
    copyPath._path = [...this._path];
    return copyPath;
  }

  public toString(): string {
    let result = '';
    for (let i = 0; i < this._path.length; i++) {
      result += this._path[i];
      if (i < this._path.length - 1) {
        result += ' - ';
      }
    }
    return result;
  }
}

export { Path };
