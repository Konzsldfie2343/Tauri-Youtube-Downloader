import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import { readText } from "@tauri-apps/api/clipboard";
import placeholder_img from "./assets/placeholder.svg";

document.onselectstart = () => false;
document.ondragstart = () => false;

const BasicButton = ({ text, onClick }: { text: string; onClick: () => void }) => {
  return (
    <motion.button
      className="base_button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}>
      {text}
    </motion.button>
  )
}

const ProgressBar = ({ item_persent }: { item_persent: number }) => {
  return (
    <div className="progress_bar">
      <div className="progress" style={{ width: `${item_persent}%` }}></div>
    </div>
  );
};

const download_item_variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DownloadItems = ({ url, removeDownloadItem }: { url: string, removeDownloadItem: (url: string) => void }) => {
  const [item_persent, setItemPersent] = useState<number>(0);
  const video_id = url.split("watch?v=")[1];
  const image_url = video_id ? `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg` : placeholder_img;
  const [title, setTitle] = useState<string>("タイトルを取得中");
  const title_cache = useRef<string>("");

  useEffect(() => {
    const getVideoInfo = async () => {
      if (title_cache.current) return;
      const video_title: string = await invoke("get_video_title", { url });
      setTitle(video_title);
      title_cache.current = video_title;
    }
    getVideoInfo();
  }, [url]);

  return (
    <motion.div
      className="download_item"
      variants={download_item_variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="image_wrapper">
        <img src={image_url} />
      </div>
      <div className="property_container">
        <div className="title">{title}</div>
        <div className="property_wrapper">
          <ProgressBar item_persent={item_persent} />
          <BasicButton text="削除" onClick={() => removeDownloadItem(url)} />
        </div>
      </div>
    </motion.div>
  );
};

const URLInput = ({ inputedURL, setInputedURL, addDownloadItem }: { inputedURL: string; setInputedURL: (url: string) => void; addDownloadItem: (url: string) => void }) => {
  return (
    <div className="url_input">
      <input type="text" className="url_input" placeholder="YoutubeのURLを入力" value={inputedURL} onChange={(e) => setInputedURL(e.target.value)} />
      <BasicButton text="追加" onClick={() => addDownloadItem(inputedURL)} />
    </div>
  );
};

const Preview = ({ url }: { url: string }) => {
  const video_id = url.split("watch?v=")[1];
  const image_url = video_id ? `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg` : placeholder_img;
  return (
    <div className="wrapper">
      <img src={image_url} style={{ width: "330px", height: "180px", outline: "1px solid rgba(0, 0, 0, 0.5)" }} />
    </div>
  );
};

const OutputPath = ({ outputPath }: { outputPath: string }) => {
  return <div className="output_path_container">出力先：{outputPath}</div>;
};

function App() {
  const [status, setStatus] = useState<"待機中" | "実行中..." | "完了">("待機中");
  const [persent, setPercent] = useState<number>(0);
  const [outputPath, setOutputPath] = useState<string>("./outputs");
  const [inputedURL, setInputedURL] = useState<string>("");
  const [urls, setUrls] = useState<string[]>(["https://www.youtube.com/watch?v=pwrjcAutgwE", "https://www.youtube.com/watch?v=6AK04Eg7ai0", "https://www.youtube.com/watch?v=9ILjzBg55WA"]);

  const addDownloadItem = (url: string) => {
    if (url) {
      setUrls((prev) => [...prev, url]);
      setInputedURL("");
    }
  };

  const removeDownloadItem = (url: string) => {
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
      addDownloadItem(clipboardText);
    }
  };

  const changeOutputPath = async () => {
    const selected = await open({ directory: true });
    if (typeof selected === "string") {
      setOutputPath(selected);
    }
  };

  const startDownload = async ({ urls, outputPath }: { urls: string[], outputPath: string }) => {
    setStatus("実行中...");
    await invoke("start_download", { urls, outputPath });
    setStatus("完了");
  };

  return (
    <div className="App">
      <div className="container" style={{ flex: 2 }}>
        <div className="wrapper" style={{ flex: 1, flexDirection: "column", overflowY: "scroll" }}>
          <div className="status_wrapper">
            <motion.div
              className="status"
              whileHover={{ letterSpacing: "10px" }}
            >{status}</motion.div>
            <div className="status">{persent}%</div>
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
