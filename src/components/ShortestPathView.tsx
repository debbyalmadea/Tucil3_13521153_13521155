import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Graph } from "@/class/Graphs/graph";
import FindingPath, { Algorithm } from "@/lib/algorithm";
import Select from "react-select";
import { Parser } from "@/class/Parser/parser";
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
import MapViewer from "./MapViewer";

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

const ShortestPathView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [graph, setGraph] = useState<Graph>(new Graph());
  const [options, setOptions] = useState<OptionInterface[]>([]);
  const [start, setStart] = useState<OptionInterface | null>(null);
  const [goal, setGoal] = useState<OptionInterface | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.UCS);
  const [mode, setMode] = useState<MapMode>(MapMode.BASIC);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.MAP);
  const [path, setPath] = useState<Path | null>(null);
  const [readAsWeighted, setReadAsWeighted] = useState(
    appMode == AppMode.GRAPH
  );
  const [directed, setDirected] = useState(false);

  useEffect(() => {
    if (start != null && goal != null && !graph.isEmpty()) {
      // calculate path
      let findingPath = new FindingPath(algorithm);
      let result = findingPath.useUCSA(graph, start.value, goal.value);
      console.log("RESULT FROM " + start.label + " TO " + goal.label);
      console.log(result?.toString());

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
          let graph = Parser.parse(content, readAsWeighted);
          setGraph(graph);
          console.log("FINISH READING FILE");
          console.log(graph.toString());

          /* set options */
          let options: OptionInterface[] = [];
          graph.getVertexes().forEach((vertex) => {
            options.push({ value: vertex, label: vertex.name });
          });
          setOptions(options);
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
  }

  /**
   * show error toast
   */
  function notifyError(message: string) {
    toast.error(message);
  }

  /**
   * add option to options
   *
   * @param option
   */
  function populateOptions() {
    /* set options */
    let options: OptionInterface[] = [];
    graph.getVertexes().forEach((vertex) => {
      options.push({ value: vertex, label: vertex.name });
    });
    setOptions(options);
    setStart(null);
    setGoal(null);
    setPath(null);
  }

  return (
    <>
      <ToastContainer position="top-center" />

      {appMode == AppMode.MAP && (
        <MapViewer
          graph={graph}
          path={path}
          populateOptions={populateOptions}
          drawMode={mode == MapMode.DRAW}
          directed={directed}
        />
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
                onClick={(e) => {
                  e.currentTarget.value = "";
                }}
              />
            </button>
            {file && <p className="mt-2">{file.name}</p>}
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
              <label htmlFor="weighted">read as weighted</label>
            </div>
          </div>

          {appMode == AppMode.MAP && (
            <>
              <div className="flex flex-row space-x-4 w-full">
                <button
                  className={`w-full py-4 font-bold hover:rounded-3xl flex-grow ${
                    mode == MapMode.BASIC
                      ? "rounded-2xl bg-white hover:bg-emerald-200"
                      : "rounded-3xl bg-emerald-600 text-white border-4 border-emerald-900"
                  }`}
                  onClick={(e) => {
                    if (mode == MapMode.BASIC) {
                      setMode(MapMode.DRAW);
                    } else {
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
              <div className="space-x-2 mt-2 text-white w-full text-left">
                <input
                  type="checkbox"
                  id="directed"
                  onChange={(e) => {
                    setDirected(!directed);
                  }}
                  checked={directed}
                />
                <label htmlFor="directed">draw directed graph</label>
              </div>
            </>
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
                <>
                  <h2 className="mt-4 font-bold">Actual Total Distance:</h2>
                  <p className="text-xs text-gray-500">
                    * assuming latitude longitude input
                  </p>
                  <p className="mt-2">
                    {(path.haversineCost * 1000).toFixed(2)} m
                  </p>
                </>
              </div>
            )}
          </div>

          <button
            className="w-full bg-white rounded-xl py-4 hover:bg-emerald-200 hover:rounded-2xl font-bold"
            onClick={(e) => {
              if (appMode == AppMode.MAP) {
                setAppMode(AppMode.GRAPH);
                setReadAsWeighted(true);
                reset();
              } else {
                setAppMode(AppMode.MAP);
                setReadAsWeighted(false);
                reset();
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
