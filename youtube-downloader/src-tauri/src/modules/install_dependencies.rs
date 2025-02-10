use std::process::Command;
use log::info;

fn is_command_available(cmd: &str) -> bool {
    Command::new(cmd)
        .arg("--version")
        .output()
        .is_ok()
}

/// OS に応じて必要な依存関係をインストールする
pub fn install_dependencies() {
    let os = std::env::consts::OS;
    let dependencies = ["yt-dlp", "ffmpeg"];

    if os == "windows" {
        if !is_command_available("winget") {
            println!("Error: winget is not available. Install it or install dependencies manually.");
            return;
        }
        for dep in dependencies {
            let status = Command::new("winget")
                .args(&["install", "-e", "--id", dep])
                .status();
            if let Ok(s) = status {
                if s.success() {
                    println!("Successfully installed {}", dep);
                } else {
                    println!("Failed to install {}", dep);
                }
            }
        }
    } else if os == "macos" {
        if !is_command_available("brew") {
            println!("Error: Homebrew is not installed. Install it first:\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"");
            return;
        }
        for dep in dependencies {
            let status = Command::new("brew")
                .args(&["install", dep])
                .status();
            if let Ok(s) = status {
                if s.success() {
                    println!("Successfully installed {}", dep);
                } else {
                    println!("Failed to install {}", dep);
                }
            }
        }
    } else {
        println!("Unsupported OS: {}", os);
    }
    info!("Dependencies installed successfully.");
}