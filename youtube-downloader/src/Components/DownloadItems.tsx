import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import placeholder_img from "../assets/placeholder.svg";
import BasicButton from "./BasicButton";
import ProgressBar from "./ProgressBar";


const download_item_variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  const DownloadItems = ({ url, removeDownloadItem }: { url: string, removeDownloadItem: (url: string) => void }) => {
    const [item_persent, setItemPersent] = useState<number>(0);
    const video_id = url.split("watch?v=")[1];
    const image_url = video_id ? `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg` : placeholder_img;
    const [title, setTitle] = useState<string>("　タイトルを取得中...　　　　　　　　");
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
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
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

export default DownloadItems