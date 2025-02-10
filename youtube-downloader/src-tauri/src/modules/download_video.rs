use rustube::Video;
use std::path::Path;
use url::Url;

pub async fn download_video(url_str: &str, output_path: &str) -> Result<String, String> {
    let url = Url::parse(url_str).map_err(|_e| "URLの形式が正しくありません".to_string())?;
    let video = Video::from_url(&url).await.map_err(|_e| "ダウンロードに失敗しました".to_string())?;
    let save_dir = Path::new(output_path);
    let path = video.best_quality().unwrap().download_to_dir(save_dir).await.map_err(|_e| "ダウンロードに失敗しました".to_string())?;
    Ok("ダウンロードに成功しました".to_string())
}