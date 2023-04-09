import { Graph } from "../Graphs/graph";
import { Vertex } from "../Graphs/vertex";


class Path {
  private _path: string[] = [];
  private _cost: number = 0;
  private _distance: number= 0;

  constructor(private graph: Graph, private _goalName : string) {}

  public get path(): string[] {
    return this._path;
  }

  public get graph_map() : Graph{
    return this.graph;
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
  
  public add(vertexName: string, isUCS : boolean): void {
    const vertexObj = this.graph.getVertexObj(vertexName);
    if (vertexObj != null) {
        let lastVertexObj: Vertex | null = null;
        if (this._path.length > 0) {
            lastVertexObj = this.graph.getVertexObj(this.lastVertex);
            this._cost += vertexObj.distanceWith(lastVertexObj!);
        }
        if(isUCS){
            this._distance = 0;
        }
        else{
            this._distance = vertexObj.distanceWith(this.graph.getVertexObj(this._goalName)!);
        }
        this._path.push(vertexName);
    }
  }

  public copy(): Path {
    const copyPath = new Path(this.graph, this._goalName);
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
