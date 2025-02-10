use log::info;
use rustube::Video;
use std::path::Path;
use url::Url;
use std::process::Command;
use tokio::sync::Mutex;
use std::sync::Arc;
use tauri::State;

pub struct Progress {
    urls: u32,
    completed: u32,
}

type SharedProgress = Arc<Mutex<Progress>>;

#[tauri::command]
pub async fn start_download(urls: Vec<String>, output_path: String, progress: State<'_, SharedProgress>) -> Result<String, String> {
    {
        let mut p = progress.lock().await;
        p.urls = urls.len() as u32;
        p.completed = 0;
    }

    for url in urls {
        let status = Command::new("yt-dlp")
            .arg("-o")
            .arg(format!("{}/%(title)s.%(ext)s", output_path))
            .arg("-f")
            .arg("bestvideo+bestaudio")
            .arg("--merge-output-format")
            .arg("mp4")
            .arg(&url)
            .status()
            .map_err(|e| e.to_string())?;

        if !status.success() {
            info!("動画のダウンロードに失敗しました");
        }

        let mut p = progress.lock().await;
        p.completed += 1;
    }
    Ok("successed".to_string())
}

#[tauri::command]
pub async fn get_download_progress(progress: State<'_, SharedProgress>) -> Result<String, String> {
    let p = progress.lock().await;
    let percent = if p.urls > 0 {
        (p.completed as f64 / p.urls as f64 * 10000.0).floor() / 100.0
    } else {
        0.0
    };
    Ok(format!("{} / {}", p.completed.to_string(), p.urls.to_string()).to_string())
}

pub fn init_progress() -> SharedProgress {
    Arc::new(Mutex::new(Progress { urls: 0, completed: 0 }))
}
