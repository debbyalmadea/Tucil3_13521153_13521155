import { Graph } from "@/class/Graphs/graph";
import { Vertex } from "@/class/Graphs/vertex";
import { Path } from "@/class/Paths/path";
import { useMemo } from "react";
// @ts-ignore
import GraphVis from "react-graph-vis";

function GraphViewer({ graph, path }: { graph: Graph; path: Path | null }) {
  const nodes = useMemo(() => {
    return graph.getVertexes().map((vertex: Vertex) => {
      return {
        id: vertex.name,
        label: vertex.name,
        x: 50 * Math.random() * 10,
        y: 50 * Math.random() * 10,
      };
    });
  }, [graph]);

  const edges: {
    from: string;
    to: string;
    color?: string;
    label?: string;
    width?: number;
  }[] = [];

  graph.getVertexes().forEach((vertex) => {
    graph.getAdjVertexes(vertex).forEach((adjVertex) => {
      edges.push({
        from: vertex.name,
        to: adjVertex.name,
        label: vertex.distanceWith(adjVertex).toFixed(2).toString(),
      });
    });
  });

  if (path != null) {
    for (let i = 0; i < path.path.length - 1; i++) {
      let start = path.path[i];
      let next = path.path[i + 1];
      let edgeId = edges.findIndex(
        (edge) => edge.from == start.name && edge.to == next.name
      );
      if (edgeId > -1) {
        edges[edgeId].color = "#ef4444";
        edges[edgeId].width = 2;
      }

      edgeId = edges.findIndex(
        (edge) => edge.from == next.name && edge.to == start.name
      );

      if (edgeId > -1) {
        edges[edgeId].color = "#ef4444";
        edges[edgeId].width = 2;
      }
    }
  }

  const graphData = {
    nodes: nodes,
    edges: edges,
  };

  const options = {
    physics: {
      enabled: false,
    },
    height: "100%",
    width: "70vw",
    nodes: {
      color: "#7dd3fc",
    },
    edges: {
      color: "#FFFFFF",
    },
  };

  return <GraphVis graph={graphData} options={options} />;
}

export default GraphViewer;
