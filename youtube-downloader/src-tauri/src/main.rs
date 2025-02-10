// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://v1.tauri.app/v1/guides/features/command

use tauri_plugin_log::LogTarget;
use log::LevelFilter;
use log::info;

mod modules {
    pub mod install_dependencies;
    pub mod get_video_title;
    pub mod start_download;
    pub mod download_video;
}

fn main() {
    tauri::Builder::default()
        .manage(modules::start_download::init_progress()) // Progress の状態を管理
        .invoke_handler(tauri::generate_handler![
            modules::get_video_title::get_video_title,
            modules::start_download::start_download,
            modules::start_download::get_download_progress
        ])
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([LogTarget::Stdout, LogTarget::Webview])
                .level(log::LevelFilter::Info)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    env_logger::init();
    modules::install_dependencies::install_dependencies();
}
