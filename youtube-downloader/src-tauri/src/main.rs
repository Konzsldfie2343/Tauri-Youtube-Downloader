// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://v1.tauri.app/v1/guides/features/command

use reqwest::Error;
use scraper::{Html, Selector};
use tokio::runtime::Runtime;

#[tauri::command]
fn get_video_title(url: &str) -> Result<String, String> {
    let rt = Runtime::new().unwrap();
    rt.block_on(async {
        let response = reqwest::get(url).await.map_err(|e| e.to_string())?.text().await.map_err(|e| "タイトルの取得に失敗しました".to_string())?;
        
        let document = Html::parse_document(&response);
        let selector = Selector::parse("title").unwrap();
        
        if let Some(title_element) = document.select(&selector).next() {
            Ok(title_element.text().collect::<String>())
        } else {
            Ok("タイトルの取得に失敗しました".to_string())
        }
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_video_title])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
