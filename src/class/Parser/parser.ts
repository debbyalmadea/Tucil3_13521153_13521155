import { Graph } from "../Graphs/graph";
import { Vertex } from "../Graphs/vertex";

export class Parser {
    /**
     * parse content of file, example can be seen in tests folder
     * TODO: Input Validation
     * @param filecontent content of the file, not the file name
     * @returns graph from the file's content
     */
  parse(filecontent: string): Graph {
    const graph = new Graph();

    const splitLine = filecontent.split("\n");

    const vertexCount = parseInt(splitLine[0]);
    const vertexes: Vertex[] = [];
    for (let i = 1; i < vertexCount + 1; i++) {
      const splitWord = splitLine[i].split(" ");
      const vertex = new Vertex(
        splitWord[0],
        parseFloat(splitWord[1]),
        parseFloat(splitWord[2])
      );
      vertexes.push(vertex);
      graph.addVertex(vertex);
    }

    // read adjacency matrix
    for (let r = 0; r < vertexCount; r++) {
      const vertex1 = vertexes[r];
      const row = splitLine[r + vertexCount + 1].split(" ");
      for (let c = 0; c < vertexCount; c++) {
        if (parseInt(row[c]) === 1) {
          const vertex2 = vertexes[c];
          graph.addEdge(vertex1, vertex2);
        }
      }
    }

    return graph;
  }
}
