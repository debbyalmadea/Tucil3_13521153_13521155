import { Graph } from "@/class/Graphs/graph";
import { LeafletMouseEvent, Map } from "leaflet";
import { useMapEvents } from "react-leaflet";

function MapEventHandler({
  graph,
  onMapLoad,
  onMapDblclick,
  onMouseDown,
  onMouseUp,
}: {
  graph: Graph;
  onMapLoad: (map: Map) => void;
  onMapDblclick?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseDown?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseUp?: (map: Map, ev: LeafletMouseEvent) => void;
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
  return null;
}

export default MapEventHandler;
