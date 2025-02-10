import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import { readText } from "@tauri-apps/api/clipboard";
import placeholder_img from "./assets/placeholder.svg";
import { homeDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";

import BasicButton from "./Components/BasicButton";
import DownloadItems from "./Components/DownloadItems";
import URLInput from "./Components/URLInput";
import Preview from "./Components/Preview";
import OutputPath from "./Components/OutputPath";

import getOutputPath from "./Modules/getOutputPath";

document.onselectstart = () => false;
document.ondragstart = () => false;

function App() {
  const [status, setStatus] = useState<"Waiting" | "Downloading..." | "Completed!">("Waiting");
  const [persent, setPercent] = useState<number>(0);
  const [outputPath, setOutputPath] = useState<string>("取得中...");
  const [inputedURL, setInputedURL] = useState<string>("");
  const [urls, setUrls] = useState<string[]>(["https://www.youtube.com/watch?v=BtR4yjBNLFU", "https://www.youtube.com/watch?v=qPV3n6zasEY", "https://www.youtube.com/watch?v=s6pj5lZsgQ8"]);

  useEffect(() => {
    getOutputPath({ setOutputPath });
  }, []);

  const addDownloadItem = ({ url }: { url: string }) => {
    if (status == "Downloading...") return;
    setUrls((prev) => [...prev, url]);
    setInputedURL("");
  };

  const removeDownloadItem = (url: string) => {
    if (status == "Downloading...") return;
    const del_index = () => {
      let i = 0;
      for (const item of urls) {
        if (item === url) return i
        i++;
      }
    }
    setUrls((prev) => prev.filter((_, index) => index !== del_index()));
  };

  const addFromClipboard = async () => {
    const clipboardText = await readText();
    if (clipboardText) {
      addDownloadItem({ url: clipboardText });
    }
  };

  const changeOutputPath = async () => {
    const selected = await open({ directory: true });
    if (typeof selected === "string") {
      setOutputPath(selected);
    }
  };

  const startDownload = async ({ urls, outputPath }: { urls: string[], outputPath: string }) => {
    setStatus("Downloading...");
    await invoke("start_download", { urls, outputPath });
    setStatus("Completed!");
  };

  return (
    <div className="App">
      <div className="container" style={{ flex: 2 }}>
        <div className="wrapper" style={{ flex: 1, flexDirection: "column", overflowY: "scroll" }}>
          <div className="status_wrapper">
            <motion.div
              className="status"
              whileHover={{ letterSpacing: "3px" }}
            >{status}</motion.div>
            <motion.div
              className="status"
              whileHover={{ letterSpacing: "10px" }}
            >
              {persent}%
            </motion.div>
          </div>
          <div className="items_wrapper">
            <AnimatePresence>
              {urls.map((url, index) => (
                <DownloadItems key={index} url={url} removeDownloadItem={removeDownloadItem} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="wrapper" style={{ flex: 2, flexDirection: "column" }}>
          <div className="wrapper" style={{ flexDirection: "column", gap: "20px", transform: "translateY(20px)" }}>
            <div className="wrapper">
              <Preview url={inputedURL} />
            </div>
            <div className="wrapper" style={{ flexDirection: "column", gap: "20px" }}>
              <URLInput inputedURL={inputedURL} setInputedURL={setInputedURL} addDownloadItem={addDownloadItem} />
              <BasicButton text="クリップボードから自動追加" onClick={addFromClipboard} />
              <OutputPath outputPath={outputPath} />
            </div>
          </div>
        </div>
        <div className="wrapper">
          <div className="button_wrapper">
            <BasicButton text="クリア" onClick={() => { window.location.href = "/" }} />
            <BasicButton text="出力先を変更" onClick={changeOutputPath} />
            <BasicButton text="ダウンロード" onClick={() => startDownload({ urls, outputPath })} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
