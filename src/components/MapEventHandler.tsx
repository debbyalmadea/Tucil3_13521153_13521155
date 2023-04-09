import { LeafletMouseEvent, Map } from "leaflet";
import { useMapEvents } from "react-leaflet";

/**
 *
 * This component handles events
 * fired from map
 */
function MapEventHandler({
  onMapLoad,
  onMapDblclick,
  onMouseDown,
  onMouseUp,
}: {
  onMapLoad: (map: Map) => void;
  onMapDblclick?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseDown?: (map: Map, ev: LeafletMouseEvent) => void;
  onMouseUp?: (map: Map, ev: LeafletMouseEvent) => void;
}) {
  const map = useMapEvents({
    dblclick(ev) {
      if (onMapDblclick) onMapDblclick(map, ev);
    },

    mousedown(ev) {
      if (onMouseDown) onMouseDown(map, ev);
    },

    mouseup(ev) {
      if (onMouseUp) onMouseUp(map, ev);
    },
  });

  onMapLoad(map);

  return null;
}

export default MapEventHandler;
