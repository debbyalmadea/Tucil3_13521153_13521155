import React, { useEffect, useState } from "react";
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
} from "leaflet";
import { Graph } from "@/class/Graphs/graph";
import FindingPath, { Algorithm } from "@/lib/algorithm";
import Select, { SingleValue } from "react-select";
import { Parser } from "@/class/Parser/parser";
import MapEventHandler from "./MapEventHandler";
import { haversineDistance } from "@/lib/operation";
import { Vertex } from "@/class/Graphs/vertex";
import { Path } from "@/class/Paths/path";
import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";

export interface MapData {
  type: string;
  position: LatLngExpression | LatLngExpression[];
  title?: string;
  popup?: string;
  tooltip?: string;
  color?: string;
}

enum MapMode {
  BASIC,
  DRAW,
}

interface OptionInterface {
  value: string;
  label: string;
}

const layers: Layer[] = [];

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
  const [tempVertex, setTempVertex] = useState<Vertex | null>(null);
  const [path, setPath] = useState<Path | null>(null);

  useEffect(() => {
    console.log(algorithm, start, goal, graph);
    if (start != null && goal != null && !graph.isEmpty()) {
      // calculate path
      drawPath("#0ea5e9");
      let findingPath = new FindingPath(algorithm);
      let result = findingPath.useUCSA(graph, start.value, goal.value);
      console.log("RESULT", result);
      if (result != undefined) {
        setPath(result);
      }
    }
  }, [start, goal, algorithm, graph]);

  useEffect(() => {
    drawPath();
  }, [path]);

  function onStartSelectChange(newValue: SingleValue<OptionInterface>) {
    if (newValue != undefined && newValue != goal) {
      setStart(newValue);
    }
  }

  function onGoalSelectChange(newValue: SingleValue<OptionInterface>) {
    if (newValue != undefined && newValue != start) {
      setGoal(newValue);
    }
  }

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
        const parser = new Parser();
        try {
          let graph = parser.parse(content);
          setGraph(graph);

          let options: OptionInterface[] = [];
          graph.getGraphKeys().forEach((key) => {
            options.push({ value: key, label: key });
          });
          setOptions(options);
          if (map != null) {
            const vertexes = graph.getVertexes();
            map.flyTo([vertexes[0].px, vertexes[0].py]);
            vertexes.forEach((vertex) => {
              let vertexMark = marker(
                { lat: vertex.px, lng: vertex.py },
                {
                  icon: new Icon({
                    iconUrl: "marker-icon-red.png",
                    iconSize: [31, 41],
                    iconAnchor: [16, 41],
                  }),
                  title: vertex.name,
                }
              ).addTo(map);
              vertexMark.bindTooltip(vertex.name);
              layers.push(vertexMark);

              graph.getAdjVertexes(vertex.name).forEach((adjVertex) => {
                addLine(
                  map,
                  [
                    [vertex.px, vertex.py],
                    [adjVertex.px, adjVertex.py],
                  ],
                  (vertex.haversineDistanceWith(adjVertex) * 1000)
                    .toFixed(2)
                    .toString() + " m"
                );
              });
            });
          }
        } catch {
          console.log("Invalid input");
          setFile(null);
          notify();
        }
      };

      reader.readAsText(file);
    }
  }

  function onMapLoad(map: Map) {
    setMap(map);
  }

  function onMapDoubleClick(map: Map, ev: LeafletMouseEvent) {
    console.log("double clicked");
    const { lat, lng } = ev.latlng;
    if (mode == MapMode.DRAW) {
      if (getVertex(lat, lng) == null) {
        let vertexName = (graph.getGraphKeys().length + 1).toString();
        addMarker(map, lat, lng, vertexName);
        graph.addVertex(new Vertex(vertexName, lat, lng));
        let newOptions = [
          ...options,
          {
            value: vertexName,
            label: vertexName,
          },
        ];
        setOptions(newOptions);
      } else {
      }
    }
  }

  function onMouseDown(map: Map, ev: LeafletMouseEvent) {
    const { lat, lng } = ev.latlng;
    if (mode == MapMode.DRAW) {
      let vertex = getVertex(lat, lng);

      if (vertex != null) {
        map.dragging.disable();
        setTempVertex(vertex);
      }
      map.dragging.enable();
    }
  }

  function onMouseUp(map: Map, ev: LeafletMouseEvent) {
    const { lat, lng } = ev.latlng;
    if (mode == MapMode.DRAW) {
      map.dragging.enable();
      let vertex = getVertex(lat, lng);
      if (vertex != null && tempVertex != null && !tempVertex.isEqual(vertex)) {
        addLine(
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

  function reset() {
    let graph = new Graph();
    setGraph(graph);
    setOptions([]);
    setStart(null);
    setGoal(null);
    setPath(null);
    if (map != null) {
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    }
  }

  function addMarker(map: Map, lat: number, lng: number, label: string) {
    let newVertex = marker(
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
    newVertex.bindTooltip(label);
    layers.push(newVertex);
  }

  function addLine(
    map: Map,
    position: LatLngExpression[],
    label: string,
    color: string = "#0ea5e9",
    opacity: number = 0.5
  ) {
    let newLine = polyline(position, { color: color, opacity: opacity }).addTo(
      map
    );
    newLine.bindTooltip(label);
    layers.push(newLine);
  }

  function drawPath(color: string = "#ef4444") {
    if (path != null && !graph.isEmpty()) {
      for (let i = 0; i < path.path.length - 1; i++) {
        let currVertex = graph.getVertexObj(path.path[i])!;
        let nextVertex = graph.getVertexObj(path.path[i + 1])!;
        if (map != null) {
          addLine(
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

  function notify() {
    toast.error("Invalid file input. Check repository for more info.");
  }

  return (
    <>
      <ToastContainer position="top-center" />
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
          graph={graph}
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

      <div className="h-full flex flex-grow flex-shrink-0 justify-center items-center px-8">
        <div className="w-[400px] h-[calc(100%-80px)] flex items-center flex-col space-y-4">
          <div className="w-full bg-white px-12 py-10 rounded-xl">
            <h1 className="text-3xl font-bold mb-4 ">Shortest Path Finder</h1>
            <button className="relative w-full">
              <label
                className="block text-lg text-white  w-full bg-emerald-500 py-2 rounded-xl hover:shadow-lg hover:shadow-emerald-200 hover:rounded-2xl hover:cursor-pointer"
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
          </div>
          <div className="w-full h-full bg-white px-12 py-10 rounded-xl divide-y space-y-4">
            <div className="w-full">
              <h2 className="mb-2">Start</h2>
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
                onChange={onStartSelectChange}
                isDisabled={options.length == 0}
              />
              <h2 className="mt-4 mb-2">Goal</h2>
              <Select
                value={goal}
                options={options}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderRadius: "10px",
                  }),
                }}
                onChange={onGoalSelectChange}
                isDisabled={options.length == 0}
              />
              <div className="flex flex-col mt-4 ">
                <h2 className="mb-2">Select Algorithm</h2>
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
                <h2 className="mt-4">Path</h2>
                <p className="mt-2">{path.toString()}</p>
                <h2 className="mt-4">Euclidean Distance: {path.cost}</h2>
                <h2 className="mt-4">
                  Haversine Distance: {(path.haversineCost * 1000).toFixed(2)} m
                </h2>
              </div>
            )}
          </div>

          <button
            className="w-full bg-white rounded-2xl py-4 hover:bg-emerald-200 hover:rounded-3xl font-bold"
            onClick={(e) => {
              if (mode == MapMode.BASIC) {
                reset();
              }
              setMode(MapMode.DRAW);
            }}
          >
            DRAW GRAPH
          </button>

          <div className="w-full flex flex-row space-x-4">
            <button
              className="w-full bg-white rounded-2xl py-4 hover:bg-emerald-200 hover:rounded-3xl font-bold"
              onClick={(e) => {
                reset();
              }}
            >
              RESET
            </button>
            <Link
              href={"https://github.com/debbyalmadea/Tucil3_13521153_13521155"}
              className="w-full"
            >
              <button className="w-full bg-white rounded-2xl py-4 hover:bg-emerald-200 hover:rounded-3xl font-bold">
                REPOSITORY
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShortestPathView;
