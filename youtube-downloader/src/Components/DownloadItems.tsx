import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import placeholder_img from "../assets/placeholder.svg";
import BasicButton from "./BasicButton";


const download_item_variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DownloadItems = ({ url, removeDownloadItem }: { url: string, removeDownloadItem: (url: string) => void }) => {
  const video_id = url.split("watch?v=")[1];
  const image_url = video_id ? `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg` : placeholder_img;
  const [title, setTitle] = useState<string>("　タイトルを取得中...　　　　　　　　");
  const title_cache = useRef<string>("");

  useEffect(() => {
    const getVideoInfo = async () => {
      if (title_cache.current) return;
      try {
        const video_title: string = await invoke("get_video_title", { url });
        const formatted_title = /^[\x00-\x7F]/.test(video_title) ? "　" + video_title : video_title;
        setTitle(formatted_title + "　");
        title_cache.current = video_title;
      } catch (error: any) {
        const [err, reason] = error;
        setTitle(`　分析失敗：${err}： ${reason}`);
        title_cache.current = error;
      }
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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="image_wrapper" style={{ width: "256px" }}>
        <img src={image_url} style={{ width: "256px", height: "144px"}} />
      </div>
      <div className="property_container">
        <div className="title" style={{ width: "116.5%", height: "80px", marginLeft: "15px" }}>{title}</div>
        <div style={{ display: "grid", gridRow: "auto", gridTemplateColumns: "3fr 1fr", gap: "10px" }}>
          <div className="output_path_container" style={{ gridRow: "auto", transform: "translateY(10px)", width: "105%" }}>URL：{url}</div>
          <div style={{ gridRow: "auto", transform: "translateX(10px)" }}>
            <BasicButton text="削除" onClick={() => removeDownloadItem(url)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DownloadItems