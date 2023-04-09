export enum Algorithm {
    UCS,
    ASTAR
}

import { Path } from "../class/Paths/path";
import { Graph } from "../class/Graphs/graph";
import { PriorityQueue } from "tstl/container/PriorityQueue"


class FindingPath{
    private pqueue : PriorityQueue<Path> = new PriorityQueue<Path>((a, b) => a.cost + a.distance >= b.cost + b.distance);
    private _isVisited: Map<string, boolean> = new Map<string, boolean>();
    private _isUCS : boolean = false;

    public useUCS(){
        this._isUCS = true;
    }
  
    public useA(){
        this._isUCS = false;
    }

    public UseUCSA(map : Graph, startName: string, finishName : string){
        let solution = new Path(map, finishName);
        solution.add(startName, this._isUCS);
        this.pqueue.push(solution);
        let found = false;
        let startVertex = map.getVertexObj(startName);
        let finishVertex = map.getVertexObj(finishName);
        let adjVertexes = map.getAdjVertexes(startName);
        if(startVertex == finishVertex){
            found = true;
            return this.pqueue.top();
        }
        while(found == false){
            solution = this.pqueue.top();
            let temp = solution.copy();
            startVertex = map.getVertexObj(solution.lastVertex);
            adjVertexes = map.getAdjVertexes(solution.lastVertex);
            this._isVisited.set(solution.lastVertex, true);
            // check the cheapest path ended up with finishnode or no
            if(startVertex == finishVertex){
                found = true;
                console.log(this.pqueue.top().cost) // cost from start - final
                console.log(this.pqueue.top().path);    // solution path
                return this.pqueue.top();
            }
            this.pqueue.pop();
            // iterate the adjacent vertexes if not visited yet
            if(adjVertexes.length > 0){
               for(let i = 0; i < adjVertexes.length; i++){
                    
                    if(this._isVisited.get(adjVertexes[i]) == undefined){
                        temp.add(adjVertexes[i], this._isUCS);
                        this.pqueue.push(temp);
                        temp = solution.copy();
                    }
                    else{
                        continue;
                    }

               }
            }
        }

        }
        
}









