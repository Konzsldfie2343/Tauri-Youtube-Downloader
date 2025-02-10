import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { AnimatePresence } from "framer-motion";
import { readText } from "@tauri-apps/api/clipboard";
import { homeDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/dialog";

import BasicButton from "./Components/BasicButton";
import DownloadItems from "./Components/DownloadItems";
import URLInput from "./Components/URLInput";
import Preview from "./Components/Preview";
import OutputPath from "./Components/OutputPath";
import StatusBar from "./Components/StatusBar";

import "./App.css";

document.onselectstart = () => false;
document.ondragstart = () => false;

function App() {
  const [status, setStatus] = useState<"Waiting" | "Downloading..." | "Completed!">("Waiting");
  const [progress, setProgress] = useState<string>("待機");
  const [outputPath, setOutputPath] = useState<string>("取得中...");
  const [inputedURL, setInputedURL] = useState<string>("");
  const [urls, setUrls] = useState<string[]>(["https://www.youtube.com/watch?v=BtR4yjBNLFU", "https://www.youtube.com/watch?v=qPV3n6zasEY", "https://www.youtube.com/watch?v=s6pj5lZsgQ8"]);

  useEffect(() => {
    getOutputPath();
  }, []);

  const addDownloadItem = ({ url }: { url: string }) => {
    if (status == "Downloading...") return;
    setUrls((prev: string[]) => [...prev, url]);
    setInputedURL("");
  };

  const addFromClipboard = async () => {
    const clipboardText = await readText();
    if (clipboardText) {
      addDownloadItem({ url: clipboardText });
    }
  };

  const getOutputPath = async () => {
    try {
      const path = await homeDir();
      const output = await join(path, "YoutubeDownloader");
      setOutputPath(output);
    } catch (error) {
      setOutputPath("取得に失敗しました");
    }
  };

  const startDownload = async ({ urls, outputPath }: { urls: string[], outputPath: string }) => {
    if (status == "Downloading...") return;
      setStatus("Downloading...");
      const intervalId = setInterval(async () => {
        setProgress(await invoke("get_download_progress"));
        if (progress == "100%") clearInterval(intervalId);
      })
      await invoke("start_download", { urls, outputPath });
      setStatus("Completed!");
      setProgress("完了");
      clearInterval(intervalId);
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

  const changeOutputPath = async () => {
    if (status == "Downloading...") return;
    const selected = await open({ directory: true });
    if (typeof selected === "string") {
      setOutputPath(selected);
    }
  };

  return (
    <div className="App">
      <div className="container" style={{ flex: 2 }}>
        <div className="wrapper" style={{ flex: 1, flexDirection: "column", overflowY: "scroll" }}>
          <StatusBar status={status} progress={progress} />
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
            <BasicButton text="出力先を変更" onClick={() => changeOutputPath()} />
            <BasicButton text="ダウンロード" onClick={() => startDownload({ urls, outputPath })} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;