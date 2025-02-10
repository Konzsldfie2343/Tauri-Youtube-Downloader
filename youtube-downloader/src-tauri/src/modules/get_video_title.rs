use reqwest::Error;
use scraper::{Html, Selector};
use tauri::command;

#[command]
pub async fn get_video_title(url: String) -> Result<String, String> {
    match reqwest::get(&url).await {
        Ok(response) => match response.text().await {
            Ok(body) => {
                let document = Html::parse_document(&body);
                let selector = Selector::parse("title").unwrap();
                if let Some(title_element) = document.select(&selector).next() {
                    Ok(title_element.text().collect::<String>())
                } else {
                    Err("タイトルの取得に失敗しました".to_string())
                }
            }
            Err(_) => Err("レスポンスの読み取りに失敗しました".to_string()),
        },
        Err(_) => Err("リクエストの送信に失敗しました".to_string()),
    }
}
