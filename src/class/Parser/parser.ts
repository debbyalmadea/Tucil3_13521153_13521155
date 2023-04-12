import { Graph } from "../Graphs/graph";
import { Vertex } from "../Graphs/vertex";

class ParserError extends Error {}

export class Parser {
    /**
     * parse content of file, example can be seen in tests folder
     * 
     * @param filecontent content of the file, not the file name
     * @returns graph from the file's content
     */
  public static parse(filecontent: string, readAsWeightedGraph: boolean = false): Graph {
    const graph = new Graph();

    const splitLine = filecontent.split("\n");

    try {
      const vertexCount = parseInt(splitLine[0]);
      const vertexes: Vertex[] = [];
      for (let i = 1; i < vertexCount + 1; i++) {
        const splitWord = splitLine[i].split(" ");
        let px = parseFloat(splitWord[1]);
        let py = parseFloat(splitWord[2]);
        if (Number.isNaN(px) || Number.isNaN(py)) {
          throw new ParserError("Invalid file input. Check repository for more info.")
        }
        const vertex = new Vertex(
          splitWord[0],
          px,
          py
        );
        vertexes.push(vertex);
        if (graph.addVertex(vertex) == 0) {
          throw new ParserError("Duplicate vertex name " + vertex.name)
        }
      }
  
      // read adjacency matrix
      for (let r = 0; r < vertexCount; r++) {
        const vertex1 = vertexes[r];
        const row = splitLine[r + vertexCount + 1].split(" ");
        for (let c = 0; c < vertexCount; c++) {
          let weight = parseFloat(row[c]);
          if (Number.isNaN(weight)) {
            throw new ParserError("Invalid file input. Check repository for more info.")
          }
          if (weight > 0 ) {
            const vertex2 = vertexes[c];
            if (!readAsWeightedGraph) {
              graph.addEdge(vertex1, vertex2);
            } else {
              graph.addEdge(vertex1, vertex2, weight);
            }
          }
        }
      }
  
      return graph;
    } catch(e) {
      if (e instanceof ParserError) {
        console.log(e.message)
        throw e
      } else {
        throw new Error("Invalid file input. Check repository for more info.")
      }
    }
  }
}
