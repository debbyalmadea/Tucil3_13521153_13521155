import Head from "next/head";
import Image from "next/image";
import Select, { SingleValue } from "react-select";
import { ChangeEvent, useEffect, useState } from "react";
import { Parser } from "@/class/Parser/parser";
import { Graph } from "@/class/Graphs/graph";
import { Algorithm } from "@/lib/algorithm";

interface optionInterface {
  value: string;
  label: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [options, setOptions] = useState<optionInterface[]>([]);
  const [start, setStart] = useState<optionInterface | null>(null);
  const [goal, setGoal] = useState<optionInterface | null>(null);
  const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.UCS);

  useEffect(() => {
    console.log(algorithm, start, goal, graph);
    if (start != null && goal != null && graph != null) {
      // calculate path
    }
  }, [start, goal, algorithm, graph]);

  function onStartSelectChange(newValue: SingleValue<optionInterface>) {
    if (newValue != undefined) {
      let newOptions = options.filter(
        (option) => option.value != newValue?.value
      );
      setOptions(newOptions);
      setStart(newValue);
    }
  }

  function onGoalSelectChange(newValue: SingleValue<optionInterface>) {
    if (newValue != undefined) {
      let newOptions = options.filter(
        (option) => option.value != newValue?.value
      );
      setOptions(newOptions);
      setGoal(newValue);
    }
  }

  function onFileUpload(input: FileList | null) {
    if (!input || input.length == 0) {
      return console.log("no file input");
    }

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
        let graph = parser.parse(content);
        setGraph(graph);
        let options: optionInterface[] = [];
        graph.getGraphKeys().forEach((key) => {
          options.push({ value: key, label: key });
        });
        setOptions(options);
        console.log(options);
        console.log(graph.toString());
      };

      reader.readAsText(file);
    }

    console.log(input);
  }

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
      <main className="w-screen h-screen relative text-black">
        <div>
          <Image src={"/placeholder.png"} alt="placeholder" fill />
        </div>
        <div className="w-[400px] h-[calc(100%-80px)] fixed right-8 top-1/2 -translate-y-1/2 bg-white px-12 py-12 flex items-center flex-col divide-y space-y-4 rounded-xl">
          <div className="w-full">
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
          <div className="w-full mt-4">
            <h2 className="mt-4 mb-2">Start</h2>
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
          <div className="w-full">
            <h2 className="mt-4">Path</h2>
            <p className="mt-2">A - B - C - D</p>
            <h2 className="mt-4">Total Distance: 39</h2>
          </div>
        </div>
      </main>
    </>
  );
}
