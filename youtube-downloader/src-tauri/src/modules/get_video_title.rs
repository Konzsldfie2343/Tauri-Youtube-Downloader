use reqwest::Client;
use scraper::{Html, Selector};

#[tauri::command]
pub async fn get_video_title(url: String) -> Result<String, (String, String)> {

    // 1. URL のバリデーション（YouTube の URL で始まっているか）
    if !url.starts_with("https://youtube.com/") && !url.starts_with("https://www.youtube.com/") {
        return Err((
            "YouTube の URL ではありません".to_string(),
            "YouTube の動画 URL を入力してください".to_string(),
        ));
    }

    let client = Client::new();

    // 2. HEADリクエストで存在確認
    let head_res = client.head(&url).send().await;
    if let Ok(res) = head_res {
        if !res.status().is_success() {
            return Err((
                "URL が見つかりませんでした".to_string(),
                "URL が間違っているか、動画が削除された可能性があります".to_string(),
            ));
        }
    } else {
        return Err((
            "サーバーが応答していません".to_string(),
            "URLが間違っているか、ネットワークに問題がある可能性があります".to_string(),
        ));
    }

    // 3. 実際に GET でページを取得
    let res = client.get(&url).send().await.map_err(|_| (
        "ページの取得に失敗しました".to_string(),
        "サーバーがダウンしているか、URL が無効な可能性があります".to_string(),
    ))?;
    
    let body = res.text().await.map_err(|_| (
        "ページの内容を取得できませんでした".to_string(),
        "無効な HTML が返された可能性があります".to_string(),
    ))?;

    // HTML からタイトルを取得
    let document = Html::parse_document(&body);
    let selector = Selector::parse("title").unwrap();

    if let Some(title_element) = document.select(&selector).next() {
        Ok(title_element.text().collect::<String>())
    } else {
        Err((
            "タイトルが取得できません".to_string(),
            "このページには <title> タグがない可能性があります".to_string(),
        ))
    }
}
