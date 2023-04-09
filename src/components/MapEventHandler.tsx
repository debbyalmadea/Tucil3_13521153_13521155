import { Graph } from "@/class/Graphs/graph";
import { haversineDistance } from "@/lib/operation";
import {
  Icon,
  LatLngLiteral,
  Layer,
  LeafletMouseEvent,
  Map,
  MarkerOptions,
  marker,
  polyline,
} from "leaflet";
import { MarkerProps, useMapEvents } from "react-leaflet";

const layers: Layer[] = [];
const markers: MarkerProps[] = [];
const lines: Layer[] = [];

export enum MapMode {
  BASIC,
  DRAW,
}

function MapEventHandler({
  graph,
  onMapLoad,
  onMapDblclick,
  onMouseDown,
  onMouseUp,
  mode,
}: {
  graph: Graph;
  onMapLoad: (map: Map) => void;
  onMapDblclick?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseDown?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseUp?: (map: Map, ev: LeafletMouseEvent) => void;
  mode?: MapMode;
}) {
  const map = useMapEvents({
    dblclick(ev) {
      if (onMapDblclick) onMapDblclick(map, ev);
      map.dragging.enable();
    },
    load(ev) {
      onMapLoad(map);
    },
    mousedown(ev) {
      if (onMouseDown) onMouseDown(map, ev);
    },
    mouseup(ev) {
      if (onMouseUp) onMouseUp(map, ev);
    },
  });

  if (graph) {
    onMapLoad(map);
  }

  //   if (mode == undefined || mode == MapMode.BASIC) {
  //     if (!graph.isEmpty()) {
  //       reset();
  //       const vertexes = graph.getVertexes();
  //       map.flyTo([vertexes[0].px, vertexes[0].py]);
  //       vertexes.forEach((vertex) => {
  //         let vertexMark = marker(
  //           { lat: vertex.px, lng: vertex.py },
  //           {
  //             icon: new Icon({
  //               iconUrl: "marker-icon-red.png",
  //               iconSize: [31, 41],
  //               iconAnchor: [16, 41],
  //             }),
  //             title: vertex.name,
  //           }
  //         ).addTo(map);
  //         vertexMark.bindTooltip(vertex.name);
  //         layers.push(vertexMark);

  //         graph.getAdjVertexes(vertex.name).forEach((adjVertex) => {
  //           console.log(adjVertex);
  //           let edgeLine = polyline([
  //             { lat: vertex.px, lng: vertex.py },
  //             { lat: adjVertex.px, lng: adjVertex.py },
  //           ]).addTo(map);
  //           let distance = vertex.haversineDistanceWith(adjVertex) * 1000;
  //           edgeLine.bindTooltip(distance.toFixed(2).toString() + " m");
  //           layers.push(edgeLine);
  //         });
  //       });
  //     }
  //   }

  function reset() {
    layers.forEach((layer) => {
      map.removeLayer(layer);
    });
  }

  return null;
}

export default MapEventHandler;
