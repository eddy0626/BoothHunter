use rusqlite::params;
use tauri::State;

use crate::database::AppDatabase;
use crate::error::AppResult;

#[tauri::command]
pub fn get_cached_translation(
    db: State<'_, AppDatabase>,
    source_text: String,
) -> AppResult<Option<String>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT translated_text FROM translations WHERE source_text = ?1",
    )?;
    let result = stmt
        .query_row(params![source_text], |row| row.get::<_, String>(0))
        .ok();
    Ok(result)
}

#[tauri::command]
pub fn save_cached_translation(
    db: State<'_, AppDatabase>,
    source_text: String,
    translated_text: String,
) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute(
        "INSERT OR REPLACE INTO translations (source_text, translated_text, created_at) VALUES (?1, ?2, datetime('now'))",
        params![source_text, translated_text],
    )?;
    Ok(())
}
