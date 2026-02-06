use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::{params, Connection};

use crate::error::{AppError, AppResult};

pub struct AppDatabase {
    conn: Mutex<Connection>,
}

impl AppDatabase {
    pub fn initialize(app_data_dir: PathBuf) -> Result<Self, AppError> {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| AppError::Database(format!("Failed to create data dir: {}", e)))?;

        let db_path = app_data_dir.join("boothhunter.db");
        let conn = Connection::open(&db_path)?;

        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys = ON;")?;

        // Idempotent migrations
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS cached_items (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price INTEGER NOT NULL,
                category_name TEXT,
                shop_name TEXT,
                url TEXT NOT NULL,
                images_json TEXT,
                tags_json TEXT,
                cached_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL UNIQUE,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                thumbnail_url TEXT,
                category_name TEXT,
                shop_name TEXT,
                added_at TEXT DEFAULT (datetime('now')),
                note TEXT
            );

            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                searched_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS popular_avatars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_ja TEXT NOT NULL UNIQUE,
                name_ko TEXT NOT NULL,
                item_count INTEGER DEFAULT 0,
                thumbnail_url TEXT,
                updated_at TEXT DEFAULT (datetime('now')),
                is_default INTEGER DEFAULT 0
            );",
        )?;

        // Indexes on frequently-queried timestamp columns
        conn.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at);
             CREATE INDEX IF NOT EXISTS idx_cached_items_cached_at ON cached_items(cached_at);
             CREATE INDEX IF NOT EXISTS idx_favorites_added_at ON favorites(added_at);",
        )?;

        // Migration v4: collections & tags
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS collections (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT NOT NULL,
                color       TEXT DEFAULT '#6366f1',
                created_at  TEXT DEFAULT (datetime('now')),
                sort_order  INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS collection_items (
                collection_id  INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
                item_id        INTEGER NOT NULL,
                added_at       TEXT DEFAULT (datetime('now')),
                PRIMARY KEY (collection_id, item_id)
            );

            CREATE TABLE IF NOT EXISTS item_tags (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id  INTEGER NOT NULL,
                tag      TEXT NOT NULL,
                UNIQUE(item_id, tag)
            );

            CREATE INDEX IF NOT EXISTS idx_collection_items_item ON collection_items(item_id);
            CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_item ON item_tags(item_id);
            CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag);",
        )?;

        // Migration v3: add wish_count column to cached_items
        let has_wish_count: bool = conn
            .prepare("SELECT wish_count FROM cached_items LIMIT 0")
            .is_ok();
        if !has_wish_count {
            conn.execute_batch("ALTER TABLE cached_items ADD COLUMN wish_count INTEGER;")?;
        }

        // Migration v2: replace old default avatars (pre-2023) with new popular ones
        let has_old_defaults: bool = conn.query_row(
            "SELECT COUNT(*) > 0 FROM popular_avatars WHERE name_ja = 'しなの' AND is_default = 1",
            [],
            |row| row.get(0),
        ).unwrap_or(false);
        if has_old_defaults {
            conn.execute("DELETE FROM popular_avatars WHERE is_default = 1", [])?;
        }

        // Seed default popular avatars (INSERT OR IGNORE is idempotent)
        Self::seed_default_avatars(&conn)?;

        // Migration v5: translations cache
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS translations (
                source_text TEXT PRIMARY KEY,
                translated_text TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );",
        )?;

        // Evict cached items older than 30 days to prevent unbounded growth
        conn.execute(
            "DELETE FROM cached_items WHERE cached_at < datetime('now', '-30 days')",
            [],
        )?;

        // Evict translations older than 90 days
        conn.execute(
            "DELETE FROM translations WHERE created_at < datetime('now', '-90 days')",
            [],
        )?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn conn(&self) -> AppResult<std::sync::MutexGuard<'_, Connection>> {
        self.conn.lock().map_err(|e| {
            log::error!("Database mutex poisoned: {}", e);
            AppError::Database(format!("Lock poisoned: {}", e))
        })
    }

    /// Alias for `conn()` — semantic hint that the caller needs mutable access (e.g. transactions).
    #[inline]
    pub fn conn_mut(&self) -> AppResult<std::sync::MutexGuard<'_, Connection>> {
        self.conn()
    }

    fn seed_default_avatars(conn: &Connection) -> AppResult<()> {
        let defaults: &[(&str, &str)] = &[
            ("キプフェル", "키프펠"),
            ("ルルネ", "루루네"),
            ("ミルティナ", "밀티나"),
            ("まめひなた", "마메히나타"),
            ("ショコラ", "쇼콜라"),
            ("しお", "시오"),
            ("Grus", "그루스"),
            ("りりか", "리리카"),
            ("狐雪", "코유키"),
            ("ミント", "민트"),
            ("みなほし", "미나호시"),
            ("しらつめ", "시라츠메"),
            ("リルモワ", "리루모와"),
            ("ソラハ", "소라하"),
            ("碼希", "마키"),
            ("カルネ", "카르네"),
            ("リーファ", "리파"),
            ("ラズリ", "라즈리"),
            ("ルーナリット", "루나릿"),
            ("ハオラン", "하오란"),
        ];
        for (ja, ko) in defaults {
            conn.execute(
                "INSERT OR IGNORE INTO popular_avatars (name_ja, name_ko, is_default) VALUES (?1, ?2, 1)",
                params![ja, ko],
            )?;
        }
        Ok(())
    }
}
