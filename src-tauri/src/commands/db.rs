use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::booth::models::BoothItem;
use crate::database::AppDatabase;
use crate::error::AppResult;

// ── Types ──────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct FavoriteItem {
    pub id: i64,
    pub item_id: i64,
    pub name: String,
    pub price: i64,
    pub thumbnail_url: Option<String>,
    pub category_name: Option<String>,
    pub shop_name: Option<String>,
    pub added_at: String,
    pub note: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AddFavoriteParams {
    pub item_id: i64,
    pub name: String,
    pub price: i64,
    pub thumbnail_url: Option<String>,
    pub category_name: Option<String>,
    pub shop_name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct PopularAvatar {
    pub id: i64,
    pub name_ja: String,
    pub name_ko: String,
    pub name_en: String,
    pub item_count: i64,
    pub thumbnail_url: Option<String>,
    pub updated_at: String,
    pub is_default: i64,
}

// ── Cache / History ────────────────────────────────────

#[tauri::command]
pub fn cache_items(db: State<'_, AppDatabase>, items: Vec<BoothItem>) -> AppResult<()> {
    let mut conn = db.conn_mut()?;
    let tx = conn.transaction()?;
    for item in &items {
        let images_json = serde_json::to_string(&item.images).unwrap_or_else(|e| {
            log::warn!("Failed to serialize images for item {}: {}", item.id, e);
            "[]".to_string()
        });
        let tags_json = serde_json::to_string(&item.tags).unwrap_or_else(|e| {
            log::warn!("Failed to serialize tags for item {}: {}", item.id, e);
            "[]".to_string()
        });
        tx.execute(
            "INSERT OR REPLACE INTO cached_items
             (id, name, description, price, category_name, shop_name, url, images_json, tags_json, wish_count, cached_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now'))",
            params![
                item.id,
                item.name,
                item.description,
                item.price,
                item.category_name,
                item.shop_name,
                item.url,
                images_json,
                tags_json,
                item.wish_lists_count,
            ],
        )?;
    }
    tx.commit()?;
    Ok(())
}

#[tauri::command]
pub fn save_search_history(db: State<'_, AppDatabase>, keyword: String) -> AppResult<()> {
    let keyword = keyword.trim().to_string();
    if keyword.is_empty() {
        return Ok(());
    }
    let conn = db.conn()?;
    conn.execute(
        "INSERT INTO search_history (keyword, searched_at) VALUES (?1, datetime('now'))",
        params![keyword],
    )?;
    // Prune old entries to prevent unbounded growth
    conn.execute(
        "DELETE FROM search_history WHERE id NOT IN (SELECT id FROM search_history ORDER BY searched_at DESC LIMIT 10000)",
        [],
    )?;
    Ok(())
}

// ── Favorites ──────────────────────────────────────────

#[tauri::command]
pub fn get_favorites(db: State<'_, AppDatabase>) -> AppResult<Vec<FavoriteItem>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT id, item_id, name, price, thumbnail_url, category_name, shop_name, added_at, note
         FROM favorites ORDER BY added_at DESC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(FavoriteItem {
                id: row.get(0)?,
                item_id: row.get(1)?,
                name: row.get(2)?,
                price: row.get(3)?,
                thumbnail_url: row.get(4)?,
                category_name: row.get(5)?,
                shop_name: row.get(6)?,
                added_at: row.get(7)?,
                note: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn add_favorite(db: State<'_, AppDatabase>, params: AddFavoriteParams) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute(
        "INSERT OR IGNORE INTO favorites
         (item_id, name, price, thumbnail_url, category_name, shop_name, added_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))",
        params![
            params.item_id,
            params.name,
            params.price,
            params.thumbnail_url,
            params.category_name,
            params.shop_name,
        ],
    )?;
    Ok(())
}

#[tauri::command]
pub fn remove_favorite(db: State<'_, AppDatabase>, item_id: i64) -> AppResult<()> {
    let mut conn = db.conn_mut()?;
    let tx = conn.transaction()?;
    tx.execute(
        "DELETE FROM collection_items WHERE item_id = ?1",
        params![item_id],
    )?;
    tx.execute("DELETE FROM item_tags WHERE item_id = ?1", params![item_id])?;
    tx.execute("DELETE FROM favorites WHERE item_id = ?1", params![item_id])?;
    tx.commit()?;
    Ok(())
}

// ── Popular Avatars ────────────────────────────────────

#[tauri::command]
pub fn get_popular_avatars(db: State<'_, AppDatabase>) -> AppResult<Vec<PopularAvatar>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT id, name_ja, name_ko, name_en, item_count, thumbnail_url, updated_at, is_default
         FROM popular_avatars ORDER BY item_count DESC, id ASC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(PopularAvatar {
                id: row.get(0)?,
                name_ja: row.get(1)?,
                name_ko: row.get(2)?,
                name_en: row.get(3)?,
                item_count: row.get(4)?,
                thumbnail_url: row.get(5)?,
                updated_at: row.get(6)?,
                is_default: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn check_avatars_need_update(db: State<'_, AppDatabase>) -> AppResult<bool> {
    let conn = db.conn()?;
    let oldest: Option<String> =
        conn.query_row("SELECT MIN(updated_at) FROM popular_avatars", [], |row| {
            row.get(0)
        })?;

    match oldest {
        None => Ok(true),
        Some(ts) => {
            let needs: bool = conn.query_row(
                "SELECT CASE WHEN datetime(?1) IS NULL THEN 1 ELSE datetime(?1) < datetime('now', '-7 days') END",
                params![ts],
                |row| row.get(0),
            )?;
            Ok(needs)
        }
    }
}

#[tauri::command]
pub fn update_popular_avatar(
    db: State<'_, AppDatabase>,
    id: i64,
    item_count: i64,
    thumbnail_url: Option<String>,
) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute(
        "UPDATE popular_avatars SET item_count = ?1, thumbnail_url = ?2, updated_at = datetime('now') WHERE id = ?3",
        params![item_count, thumbnail_url, id],
    )?;
    Ok(())
}
