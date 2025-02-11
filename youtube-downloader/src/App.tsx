import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { AnimatePresence } from "framer-motion";
import { readText } from "@tauri-apps/api/clipboard";
import { homeDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/dialog";
import { motion } from "framer-motion";

import BasicButton from "./Components/BasicButton";
import DownloadItems from "./Components/DownloadItems";
import URLInput from "./Components/URLInput";
import Preview from "./Components/Preview";
import OutputPath from "./Components/OutputPath";
import StatusBar from "./Components/StatusBar";

import "./App.css";

document.onselectstart = () => false;
document.ondragstart = () => false;
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const navigation_variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function App() {

  const [status, setStatus] = useState<"Waiting" | "Downloading..." | "Completed!">("Waiting");
  const [progress, setProgress] = useState<string>("待機");
  const [outputPath, setOutputPath] = useState<string>("取得中...");
  const [inputedURL, setInputedURL] = useState<string>("");
  const [urls, setUrls] = useState<string[]>([]);
  const duplicateURL = useRef<string>("");

  useEffect(() => {
    getOutputPath();
  }, []);

  const addDownloadItem = ({ url }: { url: string }) => {
    if (status == "Downloading...") return;
    if (urls.includes(url)) {
      duplicateURL.current = url;
      setIsDialogVisible(true)
      return
    }
    setUrls((prev: string[]) => [...prev, url]);
    setInputedURL("");
  };

  const addFromClipboard = async () => {
    if (status == "Downloading...") return;
    const clipboardText = await readText();
    if (clipboardText) {
      console.log(clipboardText);
      addDownloadItem({ url: clipboardText });
    }
  };

  const getOutputPath = async () => {
    if (status == "Downloading...") return;
    try {
      if (localStorage.getItem("outputPath")) {
        setOutputPath(localStorage.getItem("outputPath")!);
        return;
      }
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
      localStorage.setItem("outputPath", selected);
    }
  };

  const [isDialogVisible, setIsDialogVisible] = useState<Boolean>(false);

  const Dialog = () => {
    const onClick = (ans: string) => {
      if (ans == "yes") {
        setUrls((prev) => [...prev, duplicateURL.current]);
      }
      setInputedURL("");
      setIsDialogVisible(false);
    }
    return (
      <motion.div
        className="dialog"
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <div><span style={{ fontSize: "2.2rem" }}>Caution!</span><br /><br />すでに重複する項目があります。URLを追加しますか？</div>
        <div style={{ width: "80%", display: "flex", gap: "10px", justifyContent: "space-around", alignItems: "center" }}>
          <BasicButton text="いいえ" onClick={() => { onClick("no") }} />
          <BasicButton text="はい" onClick={() => { onClick("yes") }} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="App">
      <div className="container" style={{ flex: 2 }}>
        <div className="wrapper" style={{ flex: 1, flexDirection: "column", overflowY: "scroll" }}>
          <StatusBar status={status} progress={progress} />
          <div className="items_wrapper">
            {(urls.length == 0) && (
              <motion.div
                className="navigations"
                variants={navigation_variants}
                initial="hidden"
                animate="visible"
              >
                <h1>ようこそ、Youtube Downloader へ</h1><br />
                <p>1. ダウンロードしたいYoutubeの動画のURLを入力するか、クリップボードから自動入力します</p>
                <p>2. 出力先フォルダを変更したい場合は、「出力先を変更」を押すと、出力先フォルダを選択できます</p>
                <p>3. 「ダウンロード」を押すと、指定されたフォルダにダウンロードが開始されます</p>
                <p>4. 表示がおかしくなった場合や、リストをリセットしたい場合は、「クリア」を押してください</p>
                <p>5. 動画が完全にダウンロードし終わるまで、ファイルやフォルダを操作しないようにしてください</p>
              </motion.div>
            )}
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
      <AnimatePresence>
        {isDialogVisible && <Dialog />}
      </AnimatePresence>
    </div>
  );
}

export default App;