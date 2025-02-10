import { homeDir, join } from "@tauri-apps/api/path";

const getOutputPath = async ({ setOutputPath } : { setOutputPath: React.Dispatch<React.SetStateAction<string>>}) => {
    try {
      const path = await homeDir();
      const output = await join(path, "YoutubeDownloader");
      setOutputPath(output);
    } catch (error) {
      setOutputPath("取得に失敗しました");
    }
};

export default getOutputPath