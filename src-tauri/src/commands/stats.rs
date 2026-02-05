use serde::Serialize;
use tauri::State;

use crate::database::AppDatabase;
use crate::error::AppResult;

// ── Types ──────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub favorites_count: i64,
    pub collections_count: i64,
    pub tags_count: i64,
    pub searches_count: i64,
    pub total_value: i64,
    pub avg_price: i64,
}

#[derive(Debug, Serialize)]
pub struct CategoryStat {
    pub category: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct PriceBucket {
    pub label: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct TagStat {
    pub tag: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct SearchFrequency {
    pub keyword: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct MonthlyCount {
    pub month: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct ShopStat {
    pub shop: String,
    pub count: i64,
}

/// All statistics bundled into a single response to avoid 7 separate IPC round-trips.
#[derive(Debug, Serialize)]
pub struct AllStatistics {
    pub stats: DashboardStats,
    pub categories: Vec<CategoryStat>,
    pub prices: Vec<PriceBucket>,
    pub tags: Vec<TagStat>,
    pub searches: Vec<SearchFrequency>,
    pub monthly: Vec<MonthlyCount>,
    pub shops: Vec<ShopStat>,
}

// ── Commands ───────────────────────────────────────────

#[tauri::command]
pub fn get_all_statistics(db: State<'_, AppDatabase>) -> AppResult<AllStatistics> {
    let conn = db.conn()?;

    // Dashboard stats
    let favorites_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM favorites", [], |row| row.get(0))?;
    let collections_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM collections", [], |row| row.get(0))?;
    let tags_count: i64 =
        conn.query_row("SELECT COUNT(DISTINCT tag) FROM item_tags", [], |row| {
            row.get(0)
        })?;
    let searches_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM search_history", [], |row| row.get(0))?;
    let total_value: i64 =
        conn.query_row("SELECT COALESCE(SUM(price), 0) FROM favorites", [], |row| {
            row.get(0)
        })?;
    let avg_price: i64 = conn.query_row(
        "SELECT CAST(COALESCE(AVG(price), 0) AS INTEGER) FROM favorites",
        [],
        |row| row.get(0),
    )?;

    let stats = DashboardStats {
        favorites_count,
        collections_count,
        tags_count,
        searches_count,
        total_value,
        avg_price,
    };

    // Category distribution
    let categories = {
        let mut stmt = conn.prepare(
            "SELECT COALESCE(category_name, '미분류') AS cat, COUNT(*) AS cnt
             FROM favorites GROUP BY cat ORDER BY cnt DESC LIMIT 10",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(CategoryStat {
                    category: row.get(0)?,
                    count: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };

    // Price distribution
    let prices = {
        let mut stmt = conn.prepare(
            "SELECT
                SUM(CASE WHEN price = 0 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 0 AND price <= 500 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 500 AND price <= 1000 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 1000 AND price <= 3000 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 3000 AND price <= 5000 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 5000 AND price <= 10000 THEN 1 ELSE 0 END),
                SUM(CASE WHEN price > 10000 THEN 1 ELSE 0 END)
             FROM favorites",
        )?;
        let labels = [
            "무료",
            "~500",
            "501~1000",
            "1001~3000",
            "3001~5000",
            "5001~10000",
            "10000~",
        ];
        let counts = stmt.query_row([], |row| {
            let mut v = Vec::new();
            for i in 0..7 {
                v.push(row.get::<_, i64>(i).unwrap_or(0));
            }
            Ok(v)
        })?;
        let result: Vec<PriceBucket> = labels
            .iter()
            .zip(counts.iter())
            .map(|(l, c)| PriceBucket {
                label: l.to_string(),
                count: *c,
            })
            .collect();
        result
    };

    // Top tags
    let tags = {
        let mut stmt = conn.prepare(
            "SELECT tag, COUNT(*) AS cnt FROM item_tags GROUP BY tag ORDER BY cnt DESC LIMIT 15",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(TagStat {
                    tag: row.get(0)?,
                    count: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };

    // Search history stats
    let searches = {
        let mut stmt = conn.prepare(
            "SELECT keyword, COUNT(*) AS cnt FROM search_history GROUP BY keyword ORDER BY cnt DESC LIMIT 10",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(SearchFrequency {
                    keyword: row.get(0)?,
                    count: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };

    // Monthly favorites
    let monthly = {
        let mut stmt = conn.prepare(
            "SELECT strftime('%Y-%m', added_at) AS month, COUNT(*) AS cnt
             FROM favorites WHERE added_at IS NOT NULL GROUP BY month ORDER BY month ASC",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(MonthlyCount {
                    month: row.get(0)?,
                    count: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };

    // Top shops
    let shops = {
        let mut stmt = conn.prepare(
            "SELECT shop_name AS shop, COUNT(*) AS cnt
             FROM favorites WHERE shop_name IS NOT NULL AND shop_name != ''
             GROUP BY shop ORDER BY cnt DESC LIMIT 10",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(ShopStat {
                    shop: row.get(0)?,
                    count: row.get(1)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;
        rows
    };

    Ok(AllStatistics {
        stats,
        categories,
        prices,
        tags,
        searches,
        monthly,
        shops,
    })
}

#[tauri::command]
pub fn get_dashboard_stats(db: State<'_, AppDatabase>) -> AppResult<DashboardStats> {
    let conn = db.conn()?;

    let favorites_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM favorites", [], |row| row.get(0))?;
    let collections_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM collections", [], |row| row.get(0))?;
    let tags_count: i64 =
        conn.query_row("SELECT COUNT(DISTINCT tag) FROM item_tags", [], |row| {
            row.get(0)
        })?;
    let searches_count: i64 =
        conn.query_row("SELECT COUNT(*) FROM search_history", [], |row| row.get(0))?;
    let total_value: i64 =
        conn.query_row("SELECT COALESCE(SUM(price), 0) FROM favorites", [], |row| {
            row.get(0)
        })?;
    let avg_price: i64 = conn.query_row(
        "SELECT CAST(COALESCE(AVG(price), 0) AS INTEGER) FROM favorites",
        [],
        |row| row.get(0),
    )?;

    Ok(DashboardStats {
        favorites_count,
        collections_count,
        tags_count,
        searches_count,
        total_value,
        avg_price,
    })
}

#[tauri::command]
pub fn get_category_distribution(db: State<'_, AppDatabase>) -> AppResult<Vec<CategoryStat>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT COALESCE(category_name, '미분류') AS cat, COUNT(*) AS cnt
         FROM favorites
         GROUP BY cat
         ORDER BY cnt DESC
         LIMIT 10",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(CategoryStat {
                category: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn get_price_distribution(db: State<'_, AppDatabase>) -> AppResult<Vec<PriceBucket>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT
            SUM(CASE WHEN price = 0 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 0 AND price <= 500 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 500 AND price <= 1000 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 1000 AND price <= 3000 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 3000 AND price <= 5000 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 5000 AND price <= 10000 THEN 1 ELSE 0 END),
            SUM(CASE WHEN price > 10000 THEN 1 ELSE 0 END)
         FROM favorites",
    )?;
    let labels = [
        "무료",
        "~500",
        "501~1000",
        "1001~3000",
        "3001~5000",
        "5001~10000",
        "10000~",
    ];
    let row = stmt.query_row([], |row| {
        let mut counts = Vec::new();
        for i in 0..7 {
            counts.push(row.get::<_, i64>(i).unwrap_or(0));
        }
        Ok(counts)
    })?;
    let result = labels
        .iter()
        .zip(row.iter())
        .map(|(label, count)| PriceBucket {
            label: label.to_string(),
            count: *count,
        })
        .collect();
    Ok(result)
}

#[tauri::command]
pub fn get_top_tags(db: State<'_, AppDatabase>) -> AppResult<Vec<TagStat>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT tag, COUNT(*) AS cnt
         FROM item_tags
         GROUP BY tag
         ORDER BY cnt DESC
         LIMIT 15",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(TagStat {
                tag: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn get_search_history_stats(db: State<'_, AppDatabase>) -> AppResult<Vec<SearchFrequency>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT keyword, COUNT(*) AS cnt
         FROM search_history
         GROUP BY keyword
         ORDER BY cnt DESC
         LIMIT 10",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SearchFrequency {
                keyword: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn get_monthly_favorites(db: State<'_, AppDatabase>) -> AppResult<Vec<MonthlyCount>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT strftime('%Y-%m', added_at) AS month, COUNT(*) AS cnt
         FROM favorites
         WHERE added_at IS NOT NULL
         GROUP BY month
         ORDER BY month ASC",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(MonthlyCount {
                month: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn get_top_shops(db: State<'_, AppDatabase>) -> AppResult<Vec<ShopStat>> {
    let conn = db.conn()?;
    let mut stmt = conn.prepare(
        "SELECT shop_name AS shop, COUNT(*) AS cnt
         FROM favorites
         WHERE shop_name IS NOT NULL AND shop_name != ''
         GROUP BY shop
         ORDER BY cnt DESC
         LIMIT 10",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(ShopStat {
                shop: row.get(0)?,
                count: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}
