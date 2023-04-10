import React, { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
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
import { Graph } from "@/class/Graphs/graph";
import FindingPath, { Algorithm } from "@/lib/algorithm";
import Select from "react-select";
import { Parser } from "@/class/Parser/parser";
import MapEventHandler from "./MapEventHandler";
import { haversineDistance } from "@/lib/operation";
import { Vertex } from "@/class/Graphs/vertex";
import { Path } from "@/class/Paths/path";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import GraphViewer from "./GraphViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNodes,
  faMap,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

enum MapMode {
  BASIC, // can't pick vertex from map, file input only
  DRAW,
}

enum AppMode {
  GRAPH,
  MAP,
}

interface OptionInterface {
  value: Vertex;
  label: string;
}

// holds marker, polyline, etc from openstreetmap
let layers: Layer[] = [];

const ShortestPathView = () => {
  const defaultPosition: LatLngTuple = [-6.8915, 107.6107];

  const [file, setFile] = useState<File | null>(null);
  const [graph, setGraph] = useState<Graph>(new Graph());
  const [options, setOptions] = useState<OptionInterface[]>([]);
  const [start, setStart] = useState<OptionInterface | null>(null);
  const [goal, setGoal] = useState<OptionInterface | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.UCS);
  const [map, setMap] = useState<Map | null>(null);
  const [mode, setMode] = useState<MapMode>(MapMode.BASIC);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.MAP);
  const [path, setPath] = useState<Path | null>(null);
  const [readAsWeighted, setReadAsWeighted] = useState(true);
  // used in drawing edge on the map in DRAW mode
  // store vertex from mouse down event
  const [tempVertex, setTempVertex] = useState<Vertex | null>(null);

  useEffect(() => {
    console.log(algorithm, start, goal, graph);
    console.log(graph.getVertexes());
    if (start != null && goal != null && !graph.isEmpty()) {
      // redraw previous path if exists
      drawPath("#0ea5e9");

      // calculate path
      let findingPath = new FindingPath(algorithm);
      let result = findingPath.useUCSA(graph, start.value, goal.value);

      if (result != undefined) {
        if (result.path.length == 0) {
          notifyError(
            "Path not found from " + start.label + " to " + goal.label
          );
        }
        setPath(result);
      }
    }
    // eslint-disable-next-line
  }, [start, goal, algorithm, graph]);

  useEffect(() => {
    // draw path if path changes
    drawPath();
    // eslint-disable-next-line
  }, [path]);

  /**
   * handle upload file and read file
   *
   * @param input file input
   * @returns
   */
  function onFileUpload(input: FileList | null) {
    if (!input || input.length == 0) {
      return console.log("no file input");
    }

    setMode(MapMode.BASIC);
    reset();

    const textType = "text/plain";
    let file = input[0];
    if (file.type.match(textType)) {
      const reader = new FileReader();

      reader.onerror = () => {
        console.error("failed to read file", file, reader.error);
      };

      reader.onload = () => {
        setFile(file);
        let content = reader.result as string;
        try {
          let graph = Parser.parse(
            content,
            readAsWeighted && appMode == AppMode.GRAPH
          );
          setGraph(graph);

          /* set options */
          let options: OptionInterface[] = [];
          graph.getVertexes().forEach((vertex) => {
            options.push({ value: vertex, label: vertex.name });
          });
          setOptions(options);

          if (appMode == AppMode.MAP) {
            if (map != null) {
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
                    (vertex.haversineDistanceWith(adjVertex.vertex) * 1000)
                      .toFixed(2)
                      .toString() + " m"
                  );
                });
              });
            }
          }
        } catch (e) {
          console.log("Invalid input");
          setFile(null);
          if (e instanceof Error) {
            notifyError(e.message);
          } else {
            notifyError(
              "Input file possibly have incorrect format. Check repository for more info."
            );
          }
        }
      };

      reader.readAsText(file);
    }
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

    if (mode == MapMode.DRAW) {
      // if vertex don't exists in position lat, lng
      if (getVertex(lat, lng) == null) {
        let vertexName = (graph.getVertexes().length + 1).toString();
        drawMarker(map, lat, lng, vertexName);
        let newVertex = new Vertex(vertexName, lat, lng);
        graph.addVertex(newVertex);

        // add to options
        let newOptions = [
          ...options,
          {
            value: newVertex,
            label: vertexName,
          },
        ];
        setOptions(newOptions);
      }
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

    if (mode == MapMode.DRAW) {
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

    if (mode == MapMode.DRAW) {
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
        drawLine(
          map,
          [
            [vertex.px, vertex.py],
            [tempVertex.px, tempVertex.py],
          ],
          (vertex.haversineDistanceWith(tempVertex) * 1000)
            .toFixed(2)
            .toString() + " m"
        );
        graph.addEdge(tempVertex, vertex);
        setTempVertex(null);
      }
    }
  }

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
   * reset app state
   */
  function reset() {
    let graph = new Graph();
    setGraph(graph);

    setOptions([]);
    setStart(null);
    setGoal(null);
    setPath(null);
    setFile(null);

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
    opacity: number = 0.5
  ) {
    let newLine = polyline(positions, { color: color, opacity: opacity }).addTo(
      map
    );
    newLine.bindTooltip(label);
    layers.push(newLine);
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
            popup()
              .setLatLng([currVertex.px, currVertex.py])
              .setContent("Start")
              .openOn(map)
              .openPopup();
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
            0.8
          );
        }
      }
    }
  }

  /**
   * show error toast
   */
  function notifyError(message: string) {
    toast.error(message);
  }

  return (
    <>
      <ToastContainer position="top-center" />

      {appMode == AppMode.MAP && (
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
      )}

      {appMode == AppMode.GRAPH && <GraphViewer graph={graph} path={path} />}

      <div className="h-full flex flex-grow flex-shrink-0 justify-center items-center px-8 py-8">
        <div className="w-[400px] h-full flex items-center flex-col space-y-4">
          <div className="w-full bg-white px-12 py-8 rounded-xl">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Shortest Path Finder
            </h1>
            <button className="relative w-full">
              <label
                className="block text-lg text-white  w-full bg-emerald-500 py-2 rounded-xl hover:rounded-2xl hover:cursor-pointer"
                htmlFor="upload"
              >
                Select Text File
              </label>
              <input
                id="upload"
                type="file"
                accept=".txt"
                className="absolute z-[-1] top-0 left-10 w-full text-sm"
                onChange={(e) => onFileUpload(e.target.files)}
              />
            </button>
            {file && <p className="mt-2">{file.name}</p>}
            {appMode == AppMode.GRAPH && (
              <div className="space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="weighted"
                  onChange={(e) => {
                    setReadAsWeighted(!readAsWeighted);
                    reset();
                  }}
                  checked={readAsWeighted}
                />
                <label htmlFor="weighted">Weighted graph input</label>
              </div>
            )}
          </div>

          {appMode == AppMode.MAP && (
            <div className="flex flex-row space-x-4 w-full">
              <button
                className={`w-full py-4 font-bold hover:rounded-3xl flex-grow ${
                  mode == MapMode.BASIC
                    ? "rounded-2xl bg-white hover:bg-emerald-200"
                    : "rounded-3xl bg-emerald-600 text-white border-4 border-emerald-900"
                }`}
                onClick={(e) => {
                  if (mode == MapMode.BASIC) {
                    if (file != null) reset();
                    setMode(MapMode.DRAW);
                  } else {
                    if (map != null) map.dragging.enable();
                    setMode(MapMode.BASIC);
                  }
                }}
              >
                CREATE FROM MAP
              </button>
              <button
                className="bg-white rounded-2xl w-24 text-xl hover:bg-emerald-200 hover:rounded-3xl"
                onClick={reset}
              >
                <FontAwesomeIcon icon={faRotateRight} />
              </button>
            </div>
          )}

          <div className="w-full h-full overflow-scroll	 bg-white px-12 py-10 rounded-xl divide-y space-y-4">
            <div className="w-full">
              <h2 className="mb-2 font-bold">Start</h2>
              <Select
                value={start}
                options={options}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderRadius: "10px",
                    border: state.isFocused ? "4" : "2",
                    borderColor: state.isFocused ? "#22c55e" : "lightgray",
                  }),
                }}
                onChange={setStart}
                isDisabled={options.length == 0}
                maxMenuHeight={200}
              />
              <h2 className="mt-4 mb-2 font-bold">Goal</h2>
              <Select
                value={goal}
                options={options}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderRadius: "10px",
                  }),
                }}
                onChange={setGoal}
                isDisabled={options.length == 0}
                maxMenuHeight={200}
              />
              <div className="flex flex-col mt-4 ">
                <h2 className="mb-2 font-bold">Select Algorithm</h2>
                <div>
                  <input
                    type="radio"
                    name="topping"
                    value={Algorithm.UCS}
                    id="ucs"
                    onChange={(e) => setAlgorithm(Algorithm.UCS)}
                    checked={algorithm == Algorithm.UCS}
                  />
                  <label htmlFor="ucs" className="ml-2">
                    UCS
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    name="topping"
                    value={Algorithm.ASTAR}
                    id="astar"
                    checked={algorithm == Algorithm.ASTAR}
                    onChange={(e) => setAlgorithm(Algorithm.ASTAR)}
                  />
                  <label htmlFor="astar" className="ml-2">
                    A*
                  </label>
                </div>
              </div>
            </div>

            {path != null && (
              <div className="w-full">
                <h2 className="mt-4 font-bold">Path</h2>
                <p className="mt-2">{path.toString()}</p>
                <h2 className="mt-4 font-bold">Total Distance: </h2>
                <p className="mt-2">{path.cost}</p>
                <h2 className="mt-4 font-bold">Actual Total Distance:</h2>
                <p className="text-xs text-gray-500">
                  * assuming latitude longitude input
                </p>
                <p className="mt-2">
                  {(path.haversineCost * 1000).toFixed(2)} m
                </p>
              </div>
            )}
          </div>

          <button
            className="w-full bg-white rounded-xl py-4 hover:bg-emerald-200 hover:rounded-2xl font-bold"
            onClick={(e) => {
              if (appMode == AppMode.MAP) {
                setAppMode(AppMode.GRAPH);
                setMap(null);
              } else {
                setAppMode(AppMode.MAP);
              }
            }}
          >
            <FontAwesomeIcon
              icon={appMode == AppMode.MAP ? faCircleNodes : faMap}
            />
            {appMode == AppMode.MAP ? " GRAPH MODE" : " MAP MODE"}
          </button>
          <Link
            href={"https://github.com/debbyalmadea/Tucil3_13521153_13521155"}
            className="w-full"
          >
            <button className="w-full bg-white rounded-xl py-4 hover:bg-emerald-200 hover:rounded-2xl font-bold">
              REPOSITORY
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ShortestPathView;
