import { Graph } from "../Graphs/graph";
import { Vertex } from "../Graphs/vertex";


class Path {
  private _path: Vertex[] = [];
  private _cost: number = 0;
  private _distance: number= 0;
  private _haversineCost: number = 0;

  constructor(private graph: Graph, private _goal : Vertex) {}

  public get path(): Vertex[] { // get the path
    return this._path;
  }

  public get graph_map() : Graph{ // get the map graph
    return this.graph;
  }
  public get cost(): number {   // get the cost of path
    return this._cost;
  }

  public get haversineCost(): number {  // get the haversine cost
    return this._haversineCost;
  }

  public get distance(): number { // get the distance from the last node of route to the goal node
    return this._distance
  }

  public get goal():Vertex {     // get the goal vertex
    return this._goal
  }

  public get lastVertex(): Vertex {
    return this._path[this._path.length - 1]; // get the last vertex of the path
  }
  
  public add(vertex: Vertex, isUCS : boolean): void { // adding a vertex to a route
        if (this._path.length > 0) {
            this._cost += this.graph.getEdgeWeight(this.lastVertex, vertex);
            this._haversineCost += vertex.haversineDistanceWith(this.lastVertex)
        }
        if(isUCS){
            this._distance = 0;
        }
        else{
            this._distance = vertex.distanceWith(this._goal);
        }
        this._path.push(vertex);
  }

  public copy(): Path {   // return a copy of path
    const copyPath = new Path(this.graph, this._goal);
    copyPath._cost = this.cost;
    copyPath._distance = this.distance;
    copyPath._path = [...this._path];
    copyPath._haversineCost = this.haversineCost
    return copyPath;
  }

  public toString(): string {
    let result = '';
    for (let i = 0; i < this._path.length; i++) {
      result += this._path[i].name;
      if (i < this._path.length - 1) {
        result += ' - ';
      }
    }
    return result;
  }
}

export { Path };
