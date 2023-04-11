import { MapContainer, TileLayer } from "react-leaflet";
import MapEventHandler from "./MapEventHandler";
import { Graph } from "@/class/Graphs/graph";
import {
  Icon,
  LatLngExpression,
  LatLngTuple,
  Layer,
  LeafletMouseEvent,
  Map,
  marker,
  polyline,
  popup,
} from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { haversineDistance } from "@/lib/operation";
import { Vertex } from "@/class/Graphs/vertex";
import { Path } from "@/class/Paths/path";

// holds marker, polyline, etc from openstreetmap
let layers: Layer[] = [];
let pathLayers: Layer[] = [];
function MapViewer({
  graph,
  path,
  addOption,
  drawMode = false,
  directed = false,
}: {
  graph: Graph;
  path: Path | null;
  addOption: (option: { value: Vertex; label: string }) => void;
  drawMode: boolean;
  directed: boolean;
}) {
  const defaultPosition: LatLngTuple = [-6.8915, 107.6107];
  const [map, setMap] = useState<Map | null>(null);
  // used in drawing edge on the map in DRAW mode
  // store vertex from mouse down event
  const [tempVertex, setTempVertex] = useState<Vertex | null>(null);

  // eslint-disable-next-line
  useMemo(() => drawGraph(), [graph]);
  useEffect(() => {
    if (map != null) {
      pathLayers.forEach((layer) => {
        layer.removeFrom(map);
      });
    }
    drawPath();
    // eslint-disable-next-line
  }, [path]);

  /**
   *
   * @param lat
   * @param lng
   * @returns vertex having latitude lat and longitude lng or near
   *          it if exits with error 10 meters (in haversineDistance)
   */
  function getVertex(lat: number, lng: number): Vertex | null {
    let foundVertex = null;
    graph.getVertexes().forEach((vertex) => {
      if (
        haversineDistance(
          { lat: vertex.px, lng: vertex.py },
          {
            lat: lat,
            lng: lng,
          }
        ) *
          1000 <=
        10.0
      ) {
        foundVertex = vertex;
      }
    });

    return foundVertex;
  }

  /**
   * handle map load
   *
   * @param map
   */
  function onMapLoad(map: Map) {
    // store it to use it later
    setMap(map);
  }

  /**
   * handle double click event
   *
   * @param map
   * @param ev
   */
  function onMapDoubleClick(map: Map, ev: LeafletMouseEvent) {
    const { lat, lng } = ev.latlng;

    // if vertex don't exists in position lat, lng
    if (getVertex(lat, lng) == null && drawMode) {
      console.log("draw mode");
      let vertexName = (graph.getVertexes().length + 1).toString();
      drawMarker(map, lat, lng, vertexName);
      let newVertex = new Vertex(vertexName, lat, lng);
      graph.addVertex(newVertex);

      // add to options
      let newOptions = { value: newVertex, label: vertexName };
      addOption(newOptions);
    }
  }

  /**
   * handle mouse down event
   *
   * @param map
   * @param ev
   */
  function onMouseDown(map: Map, ev: LeafletMouseEvent) {
    const { lat, lng } = ev.latlng;

    if (drawMode) {
      let vertex = getVertex(lat, lng);

      // if there is vertex in lat, lng position
      if (vertex != null) {
        map.dragging.disable();
        setTempVertex(vertex); // store it
      }
      // map.dragging.enable();
    }
  }

  /**
   * handle mouse up event
   *
   * @param map
   * @param ev
   */
  function onMouseUp(map: Map, ev: LeafletMouseEvent) {
    const { lat, lng } = ev.latlng;

    if (drawMode) {
      map.dragging.enable();

      let vertex = getVertex(lat, lng);

      /**
       * edges will be drawn if
       * 1. the vertex in position lat, lng exists
       * 2. there is vertex obtained from mouse down event
       * 3. vertex from mouse down event is not equal to
       *    vertex from mouse up event
       */
      if (vertex != null && tempVertex != null && !tempVertex.isEqual(vertex)) {
        console.log(tempVertex, vertex);
        if (graph.addEdge(tempVertex, vertex)) {
          if (!directed) {
            graph.addEdge(vertex, tempVertex);
          }
          drawLine(
            map,
            [
              [vertex.px, vertex.py],
              [tempVertex.px, tempVertex.py],
            ],
            graph.getEdgeWeight(tempVertex, vertex).toFixed(2).toString() +
              " / " +
              (vertex.haversineDistanceWith(tempVertex) * 1000)
                .toFixed(2)
                .toString() +
              " m"
          );
        }
        setTempVertex(null);
      }
    }
  }

  /**
   * reset app state
   */
  function reset() {
    if (map != null) {
      map.dragging.enable();
      // delete all marker and polyline
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });

      layers = [];
    }
  }

  /**
   * Draw marker on map
   *
   * @param map
   * @param lat
   * @param lng
   * @param label will be shown when hovering
   */
  function drawMarker(map: Map, lat: number, lng: number, label: string) {
    let newMarker = marker(
      { lat: lat, lng: lng },
      {
        icon: new Icon({
          iconUrl: "marker-icon-red.png",
          iconSize: [31, 41],
          iconAnchor: [16, 41],
        }),
        title: label,
      }
    ).addTo(map);
    newMarker.bindTooltip(label);
    layers.push(newMarker);
  }

  /**
   * Draw line that connects points in positions
   *
   * @param map
   * @param positions
   * @param label will be shown when hovering
   * @param color
   * @param opacity
   */
  function drawLine(
    map: Map,
    positions: LatLngExpression[],
    label: string,
    color: string = "#0ea5e9",
    opacity: number = 0.5,
    isPath: boolean = false
  ) {
    let newLine = polyline(positions, {
      color: color,
      opacity: opacity,
    }).addTo(map);
    newLine.bindTooltip(label);
    if (!isPath) layers.push(newLine);
    else pathLayers.push(newLine);
  }

  /**
   * draw path
   *
   * @param color
   */
  function drawPath(color: string = "#ef4444") {
    if (path != null && !graph.isEmpty()) {
      for (let i = 0; i < path.path.length - 1; i++) {
        let currVertex = path.path[i];
        let nextVertex = path.path[i + 1];
        if (map != null) {
          if (i == 0) {
            let startPopup = popup()
              .setLatLng([currVertex.px, currVertex.py])
              .setContent("Start")
              .openOn(map)
              .openPopup();
            layers.push(startPopup);
          }
          drawLine(
            map,
            [
              [currVertex.px, currVertex.py],
              [nextVertex.px, nextVertex.py],
            ],
            (currVertex.haversineDistanceWith(nextVertex) * 1000)
              .toFixed(2)
              .toString() + " m",
            color,
            0.8,
            true
          );
        }
      }
    }
  }

  /**
   * draw graph on map
   */
  function drawGraph() {
    reset();
    if (map != null && !graph.isEmpty()) {
      const vertexes = graph.getVertexes();
      map.flyTo([vertexes[0].px, vertexes[0].py]);
      vertexes.forEach((vertex) => {
        // draw vertex
        drawMarker(map, vertex.px, vertex.py, vertex.name);

        // search for its adjency vertexes
        graph.getAdjVertexes(vertex).forEach((adjVertex) => {
          // draw edge
          drawLine(
            map,
            [
              [vertex.px, vertex.py],
              [adjVertex.vertex.px, adjVertex.vertex.py],
            ],
            adjVertex.weight.toFixed(2).toString() +
              " / " +
              (vertex.haversineDistanceWith(adjVertex.vertex) * 1000)
                .toFixed(2)
                .toString() +
              " m"
          );
        });
      });
    }
  }
  return (
    <MapContainer
      center={
        graph.isEmpty()
          ? defaultPosition
          : [graph.getVertexes()[0].px, graph.getVertexes()[0].py]
      }
      zoom={50}
      scrollWheelZoom={false}
      style={{
        width: "70vw",
        height: "100vh",
      }}
    >
      <MapEventHandler
        onMapLoad={onMapLoad}
        onMapDblclick={onMapDoubleClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default MapViewer;
