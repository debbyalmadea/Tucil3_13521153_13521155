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
        color: "#7dd3fc",
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
        to: adjVertex.vertex.name,
        label:
          adjVertex.weight.toFixed(2).toString() +
          " / " +
          (vertex.haversineDistanceWith(adjVertex.vertex) * 1000)
            .toFixed(2)
            .toString() +
          " m",
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
    height: "100%",
    width: "70vw",
    edges: {
      color: "#FFFFFF",
      font: {
        size: 5,
      },
    },
    nodes: {
      font: {
        size: 8,
      },
    },
  };

  return (
    <div className="relative w-full h-full">
      <p className="text-white absolute left-10 bottom-10">
        {"> The position does not represent actual position of the vertexes"}
      </p>
      <GraphVis graph={graphData} options={options} />
    </div>
  );
}

export default GraphViewer;
