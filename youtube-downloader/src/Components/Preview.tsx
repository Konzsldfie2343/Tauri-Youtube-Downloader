import { motion } from "framer-motion";
import placeholder_img from "../assets/placeholder.svg";

const Preview = ({ url }: { url: string }) => {
  const video_id = url.split("watch?v=")[1];
  const image_url = video_id ? `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg` : placeholder_img;
  return (
    <div className="wrapper">
      <img src={image_url} style={{ width: "330px", height: "180px", outline: "1px solid rgba(0, 0, 0, 0.5)" }} />
    </div>
  );
};

export default Preview