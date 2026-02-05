use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::database::AppDatabase;
use crate::error::{AppError, AppResult};

use super::db::FavoriteItem;

// ── Validation ────────────────────────────────────────

fn validate_name(name: &str) -> AppResult<String> {
    let trimmed = name.trim().to_string();
    if trimmed.is_empty() {
        return Err(AppError::ParseError("Name cannot be empty".to_string()));
    }
    if trimmed.len() > 200 {
        return Err(AppError::ParseError(
            "Name too long (max 200 chars)".to_string(),
        ));
    }
    Ok(trimmed)
}

fn validate_color(color: &str) -> AppResult<()> {
    let valid = color.len() == 7
        && color.starts_with('#')
        && color[1..].chars().all(|c| c.is_ascii_hexdigit());
    if !valid {
        return Err(AppError::ParseError(
            "Invalid color format (expected #RRGGBB)".to_string(),
        ));
    }
    Ok(())
}

// ── Types ──────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct Collection {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub created_at: String,
    pub sort_order: i64,
    pub item_count: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateCollectionParams {
    pub name: String,
    pub color: Option<String>,
}

// ── Collections CRUD ───────────────────────────────────

#[tauri::command]
pub fn get_collections(db: State<'_, AppDatabase>) -> AppResult<Vec<Collection>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT c.id, c.name, c.color, c.created_at, c.sort_order,
                COALESCE(COUNT(ci.item_id), 0) AS item_count
         FROM collections c
         LEFT JOIN collection_items ci ON ci.collection_id = c.id
         GROUP BY c.id
         ORDER BY c.sort_order ASC, c.id ASC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Collection {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
                sort_order: row.get(4)?,
                item_count: row.get(5)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn create_collection(
    db: State<'_, AppDatabase>,
    params: CreateCollectionParams,
) -> AppResult<i64> {
    let name = validate_name(&params.name)?;
    let color = params.color.unwrap_or_else(|| "#6366f1".to_string());
    validate_color(&color)?;
    let conn = db.conn()?;
    conn.execute(
        "INSERT INTO collections (name, color) VALUES (?1, ?2)",
        params![name, color],
    )?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn rename_collection(db: State<'_, AppDatabase>, id: i64, name: String) -> AppResult<()> {
    let name = validate_name(&name)?;
    let conn = db.conn()?;
    conn.execute(
        "UPDATE collections SET name = ?1 WHERE id = ?2",
        params![name, id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn update_collection_color(
    db: State<'_, AppDatabase>,
    id: i64,
    color: String,
) -> AppResult<()> {
    validate_color(&color)?;
    let conn = db.conn()?;
    conn.execute(
        "UPDATE collections SET color = ?1 WHERE id = ?2",
        params![color, id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn delete_collection(db: State<'_, AppDatabase>, id: i64) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute("DELETE FROM collections WHERE id = ?1", params![id])?;
    Ok(())
}

// ── Collection membership ──────────────────────────────

#[tauri::command]
pub fn add_to_collection(
    db: State<'_, AppDatabase>,
    collection_id: i64,
    item_id: i64,
) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute(
        "INSERT OR IGNORE INTO collection_items (collection_id, item_id) VALUES (?1, ?2)",
        params![collection_id, item_id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn remove_from_collection(
    db: State<'_, AppDatabase>,
    collection_id: i64,
    item_id: i64,
) -> AppResult<()> {
    let conn = db.conn()?;
    conn.execute(
        "DELETE FROM collection_items WHERE collection_id = ?1 AND item_id = ?2",
        params![collection_id, item_id],
    )?;
    Ok(())
}

#[tauri::command]
pub fn get_collection_items(
    db: State<'_, AppDatabase>,
    collection_id: i64,
) -> AppResult<Vec<FavoriteItem>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT f.id, f.item_id, f.name, f.price, f.thumbnail_url,
                f.category_name, f.shop_name, f.added_at, f.note
         FROM favorites f
         INNER JOIN collection_items ci ON ci.item_id = f.item_id
         WHERE ci.collection_id = ?1
         ORDER BY ci.added_at DESC",
    )?;
    let rows = stmt
        .query_map(params![collection_id], |row| {
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

/// Get all collection IDs that a given item belongs to
#[tauri::command]
pub fn get_item_collections(db: State<'_, AppDatabase>, item_id: i64) -> AppResult<Vec<i64>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare("SELECT collection_id FROM collection_items WHERE item_id = ?1")?;
    let rows = stmt
        .query_map(params![item_id], |row| row.get(0))?
        .collect::<Result<Vec<i64>, _>>()?;
    Ok(rows)
}

// ── Item tags ──────────────────────────────────────────

#[tauri::command]
pub fn set_item_tags(db: State<'_, AppDatabase>, item_id: i64, tags: Vec<String>) -> AppResult<()> {
    let mut conn = db.conn_mut()?;
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM item_tags WHERE item_id = ?1", params![item_id])?;
    for tag in &tags {
        let trimmed = tag.trim();
        if trimmed.is_empty() || trimmed.len() > 100 {
            continue;
        }
        tx.execute(
            "INSERT OR IGNORE INTO item_tags (item_id, tag) VALUES (?1, ?2)",
            params![item_id, trimmed],
        )?;
    }
    tx.commit()?;
    Ok(())
}

#[tauri::command]
pub fn get_item_tags(db: State<'_, AppDatabase>, item_id: i64) -> AppResult<Vec<String>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare("SELECT tag FROM item_tags WHERE item_id = ?1 ORDER BY tag")?;
    let rows = stmt
        .query_map(params![item_id], |row| row.get(0))?
        .collect::<Result<Vec<String>, _>>()?;
    Ok(rows)
}

/// Batch: get tags for all favorited items in one query.
/// Returns a map of item_id → [tag, tag, ...]
#[tauri::command]
pub fn get_all_item_tags_batch(
    db: State<'_, AppDatabase>,
) -> AppResult<std::collections::HashMap<i64, Vec<String>>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT it.item_id, it.tag FROM item_tags it
         INNER JOIN favorites f ON f.item_id = it.item_id
         ORDER BY it.item_id, it.tag",
    )?;
    let mut map: std::collections::HashMap<i64, Vec<String>> = std::collections::HashMap::new();
    let mut rows = stmt.query([])?;
    while let Some(row) = rows.next()? {
        let item_id: i64 = row.get(0)?;
        let tag: String = row.get(1)?;
        map.entry(item_id).or_default().push(tag);
    }
    Ok(map)
}

/// Batch: get collection memberships for all favorited items in one query.
/// Returns a map of item_id → [collection_id, ...]
#[tauri::command]
pub fn get_all_item_collections_batch(
    db: State<'_, AppDatabase>,
) -> AppResult<std::collections::HashMap<i64, Vec<i64>>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT ci.item_id, ci.collection_id FROM collection_items ci
         INNER JOIN favorites f ON f.item_id = ci.item_id
         ORDER BY ci.item_id",
    )?;
    let mut map: std::collections::HashMap<i64, Vec<i64>> = std::collections::HashMap::new();
    let mut rows = stmt.query([])?;
    while let Some(row) = rows.next()? {
        let item_id: i64 = row.get(0)?;
        let collection_id: i64 = row.get(1)?;
        map.entry(item_id).or_default().push(collection_id);
    }
    Ok(map)
}

#[tauri::command]
pub fn get_all_user_tags(db: State<'_, AppDatabase>) -> AppResult<Vec<String>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare("SELECT DISTINCT tag FROM item_tags ORDER BY tag")?;
    let rows = stmt
        .query_map([], |row| row.get(0))?
        .collect::<Result<Vec<String>, _>>()?;
    Ok(rows)
}
