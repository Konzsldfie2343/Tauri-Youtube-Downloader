use log::info;
use rustube::Video;
use std::path::Path;
use url::Url;
use std::process::Command;
use tokio::process::Command as TokioCommand;
use futures::stream::{StreamExt, FuturesUnordered};

#[tauri::command]
pub async fn start_download(urls: Vec<String>, output_path: &str) -> Result<(), String> {
    for url in urls {
        let status = Command::new("yt-dlp")
            .arg("-o")
            .arg(format!("{}/%(title)s.%(ext)s", output_path))
            .arg("-f")
            .arg("bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]")
            .arg("--recode-video")
            .arg("mp4") // MP4 形式でエンコード
            .arg("--postprocessor-args")
            .arg("ffmpeg:-c:v libx264 -preset slow -crf 23") // FFmpeg のエンコード設定
            .arg(&url)
            .status()
            .map_err(|_| "yt-dlp の実行に失敗しました".to_string())?;

        if !status.success() {
            info!("動画のダウンロードに失敗しました");
        }
    }
    Ok(())
}