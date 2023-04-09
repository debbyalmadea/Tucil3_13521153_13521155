import Head from "next/head";
import Image from "next/image";
import Select, { SingleValue } from "react-select";
import { ChangeEvent, useEffect, useState } from "react";
import { Parser } from "@/class/Parser/parser";
import { Graph } from "@/class/Graphs/graph";
import { Algorithm } from "@/lib/algorithm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes, faMap } from "@fortawesome/free-solid-svg-icons";
import GoogleMapReact, { MapOptions, Maps } from "google-map-react";
import NetworkGraph from "@/components/NetworkGraph";
import { map } from "leaflet";
import dynamic from "next/dynamic";
import { MapData } from "@/components/ShortestPathView";
const ShortestPathView = dynamic(
  () => import("@/components/ShortestPathView"),
  {
    ssr: false,
  }
);
interface optionInterface {
  value: string;
  label: string;
}

export default function Home() {
  // const [file, setFile] = useState<File | null>(null);
  // const [graph, setGraph] = useState<Graph | null>(null);
  // const [options, setOptions] = useState<optionInterface[]>([]);
  // const [start, setStart] = useState<optionInterface | null>(null);
  // const [goal, setGoal] = useState<optionInterface | null>(null);
  // const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.UCS);
  // // const [visualizer, setVisualizer] = useState<Visualizer>(Visualizer.MAP);
  // const [mapData, setMapData] = useState<MapData[]>([]);

  // useEffect(() => {
  //   console.log(algorithm, start, goal, graph);
  //   if (start != null && goal != null && graph != null) {
  //     // calculate path
  //   }
  // }, [start, goal, algorithm, graph]);

  // function onStartSelectChange(newValue: SingleValue<optionInterface>) {
  //   if (newValue != undefined) {
  //     let newOptions = options.filter(
  //       (option) => option.value != newValue?.value
  //     );
  //     setOptions(newOptions);
  //     setStart(newValue);
  //   }
  // }

  // function onGoalSelectChange(newValue: SingleValue<optionInterface>) {
  //   if (newValue != undefined) {
  //     let newOptions = options.filter(
  //       (option) => option.value != newValue?.value
  //     );
  //     setOptions(newOptions);
  //     setGoal(newValue);
  //   }
  // }

  // function onFileUpload(input: FileList | null) {
  //   if (!input || input.length == 0) {
  //     return console.log("no file input");
  //   }

  //   const textType = "text/plain";
  //   let file = input[0];
  //   if (file.type.match(textType)) {
  //     const reader = new FileReader();

  //     reader.onerror = () => {
  //       console.error("failed to read file", file, reader.error);
  //     };

  //     reader.onload = () => {
  //       setFile(file);
  //       let content = reader.result as string;
  //       const parser = new Parser();
  //       let graph = parser.parse(content);
  //       setGraph(graph);

  //       let options: optionInterface[] = [];
  //       graph.getGraphKeys().forEach((key) => {
  //         options.push({ value: key, label: key });
  //       });
  //       setOptions(options);

  //       let mapData: MapData[] = [];
  //       graph.getVertexes().forEach((vertex) => {
  //         mapData.push({
  //           type: "marker",
  //           position: [vertex.px, vertex.py],
  //           title: vertex.name,
  //           tooltip: vertex.name,
  //         });

  //         graph.getAdjVertexes(vertex.name).forEach((adjVertex) => {
  //           mapData.push({
  //             type: "line",
  //             position: [
  //               [vertex.px, vertex.py],
  //               [adjVertex.px, adjVertex.py],
  //             ],
  //             tooltip:
  //               (vertex.haversineDistanceWith(adjVertex) * 1000)
  //                 .toFixed(2)
  //                 .toString() + " m",
  //           });
  //         });
  //       });
  //     };

  //     reader.readAsText(file);
  //   }

  //   console.log(input);
  // }

  return (
    <>
      <Head>
        <title>Shortest Path Finder</title>
        <meta
          name="description"
          content="Shortest path finder with UCS and A* algorithm"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-screen h-screen relative text-black bg-gradient-to-tl from-emerald-900 via-emerald-700 to-emerald-200 flex flex-row justify-between items-center">
        {/* {visualizer == Visualizer.GRAPH && (
          <div className="w-full h-full bg-emerald-950">
            {graph && (
              <div className="w-full h-full">
                <NetworkGraph graph={graph} />
              </div>
            )}
          </div>
        )} */}
        <ShortestPathView />

        {/* <button
          className="w-24 h-24 bg-white rounded-full fixed left-[450px] bottom-10 flex justify-center items-center text-emerald-500 hover:bg-emerald-500 hover:text-white"
          onClick={(e) =>
            setVisualizer(
              visualizer == Visualizer.MAP ? Visualizer.GRAPH : Visualizer.MAP
            )
          }
        >
          <div className="w-12 h-12">
            <FontAwesomeIcon
              icon={visualizer == Visualizer.GRAPH ? faMap : faCircleNodes}
            />
          </div>
        </button> */}
      </main>
    </>
  );
}
