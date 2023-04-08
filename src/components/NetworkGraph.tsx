import { useEffect, useState } from "react";
import { Graph } from "@/class/Graphs/graph";
// @ts-ignore
import BareMinimum2d from "bare-minimum-2d";
// @ts-ignore
import textMarker from "bare-minimum-text-marker";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface PointInterface {
  x: number[];
  y: number[];
  color: string;
  opacity: number;
  size: number;
  type: string;
  id: string;
  gap?: number;
  yOffset?: number;
}

interface LabelInterface {
  x: number[];
  y: number[];
  color: string;
  opacity: number;
  size: number;
  type: string;
  id: string;
  label: string;
}

interface LineInterface {
  x0: number[];
  y0: number[];
  x1: number[];
  y1: number[];
  color: string;
  opacity: number;
  size: number;
  type: string;
  id: string;
}

function NetworkGraph({ graph }: { graph: Graph }) {
  const [data, setData] = useState<
    Array<PointInterface | LineInterface | LabelInterface>
  >([]);
  const container = {
    color: "#022c22",
    xRange: Math.max(graph.maxX!, Math.abs(graph.minX!)) * 2 + 4,
    yRange: Math.max(graph.maxY!, Math.abs(graph.minY!)) * 2 + 4,
  };
  console.log(Math.max(graph.maxY!, Math.abs(graph.minY!)));

  useEffect(() => {
    const vertexes = graph.getVertexes();
    console.log(vertexes);
    let data: Array<PointInterface | LineInterface | LabelInterface> = [];
    vertexes.forEach((vertex) => {
      data.push({
        x: [vertex.px],
        y: [vertex.py],
        color: "#FFFFFF",
        opacity: 0.5,
        size: Math.min(0.002 * Math.max(container.xRange, container.yRange), 2),
        type: "points",
        id: "vertex-" + vertex.name,
      });

      const adjVertexes = graph.getAdjVertexes(vertex.name);
      adjVertexes.forEach((adjVertexName) => {
        const adjVertex = graph.getVertexObj(adjVertexName)!;
        data.push({
          x0: [adjVertex.px],
          y0: [adjVertex.py],
          x1: [vertex.px],
          y1: [vertex.py],
          color: "#FFFFFF",
          opacity: 0.2,
          size: Math.min(
            0.0005 * Math.max(container.xRange, container.yRange),
            2
          ),
          type: "lines",
          id: "edge-" + vertex.name + "-" + adjVertex.name,
        });
      });
    });

    vertexes.forEach((vertex) => {
      data.push({
        x: [vertex.px],
        y: [vertex.py],
        color: "#10b981",
        opacity: 1.0,
        size: Math.min(0.005 * Math.max(container.xRange, container.yRange), 2),
        label: vertex.name,
        type: "textMarker",
        id: "label-" + vertex.name,
      });

      const adjVertexes = graph.getAdjVertexes(vertex.name);
      adjVertexes.forEach((adjVertexName) => {
        const adjVertex = graph.getVertexObj(adjVertexName)!;
        data.push({
          x: [(vertex.px + adjVertex.px) / 2],
          y: [(vertex.py + adjVertex.py) / 2],
          color: "#6ee7b7",
          opacity: 1.0,
          size: Math.min(
            0.002 * Math.max(container.xRange, container.yRange),
            2
          ),
          label: vertex.distanceWith(adjVertex).toFixed(2).toString(),
          type: "textMarker",
          id: "label-" + vertex.name,
        });
      });
    });

    setData(data);
  }, []);

  return (
    <div className="min-w-full min-h-full bg-transparent">
      <TransformWrapper>
        <TransformComponent>
          {data.length > 0 && (
            <BareMinimum2d {...{ data, container }} plugins={[textMarker]} />
          )}
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default NetworkGraph;
