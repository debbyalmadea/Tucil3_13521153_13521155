export enum Algorithm {
    UCS,
    ASTAR
}

import { Path } from "../class/Paths/path";
import { Graph } from "../class/Graphs/graph";
import { PriorityQueue } from "tstl/container/PriorityQueue"
import { Vertex } from "@/class/Graphs/vertex";


class FindingPath{
    private _pqueue : PriorityQueue<Path> = new PriorityQueue<Path>((a, b) => a.cost + a.distance >= b.cost + b.distance);
    private _isVisited: Map<Vertex, boolean> = new Map<Vertex, boolean>();
    private _isUCS : boolean = false;

    constructor(algorithm: Algorithm) {
        this._isUCS = algorithm == Algorithm.UCS
    }

    public get pqueue(): PriorityQueue<Path> {
        return this._pqueue
    }

    public useUCS(){
        this._isUCS = true;
    }
  
    public useA(){
        this._isUCS = false;
    }

    public useUCSA(map : Graph, start: Vertex, finish : Vertex){
        console.log("HEYYYYYYYYYYYYyyy")
        let solution = new Path(map, finish);
        solution.add(start, this._isUCS);
        this.pqueue.push(solution);
        let found = false;
        let cantfound = false;
        // let startVertex = map.getVertexObj(start);
        // let finishVertex = map.getVertexObj(finish);
        let adjVertexes = map.getAdjVertexes(start);
        if(start == finish){
            found = true;
            return this.pqueue.top();
        }
        while(found == false && cantfound == false){
            solution = this.pqueue.top();

            if (solution != undefined) {
                let temp = solution.copy();
                start = solution.lastVertex;
                adjVertexes = map.getAdjVertexes(solution.lastVertex);
                console.log("path sejauh ini: " + solution + " cost: " + solution.cost + solution.distance);
                if(this._isVisited.get(solution.lastVertex) != true){
                    this._isVisited.set(solution.lastVertex, true); //
                }
                // check the cheapest path ended up with finishnode or no
                if(start == finish){
                    found = true;
                    console.log(this.pqueue.top().cost) // cost from start - final
                    console.log(this.pqueue.top().path);    // solution path
                    return this.pqueue.top();
                }
                
                this.pqueue.pop();
                // iterate the adjacent vertexes if not visited yet
                if(adjVertexes.length > 0){
                   for(let i = 0; i < adjVertexes.length; i++){
                        if (this._isVisited.get(adjVertexes[i].vertex) == undefined){
                            temp.add(adjVertexes[i].vertex, this._isUCS);
                            console.log("tambahin node: " + temp + " " + (temp.cost + temp.distance));
                            this.pqueue.push(temp);
                            temp = solution.copy();
                        }
                        else {
                            continue;
                        }
    
                   }
                }

            }
            if (this.pqueue.empty() && !found) {
                cantfound = true;
                console.log("Tidak ditemukan solusi");
                solution = new Path(map, finish);
                this.pqueue.push(solution);
                return this.pqueue.top();
            }
        }
    }
}

export default FindingPath









