use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, State};
use tauri_plugin_updater::Update;

#[derive(Debug, thiserror::Error)]
pub enum UpdateError {
    #[error(transparent)]
    Updater(#[from] tauri_plugin_updater::Error),
    #[error("There is no pending update")]
    NoPendingUpdate,
}

impl Serialize for UpdateError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

type UpdateResult<T> = Result<T, UpdateError>;

#[derive(Default)]
pub struct PendingUpdate(pub Mutex<Option<Update>>);

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub version: String,
    pub body: Option<String>,
}

#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    pending_update: State<'_, PendingUpdate>,
) -> UpdateResult<()> {
    let update = pending_update
        .0
        .lock()
        .unwrap()
        .take()
        .ok_or(UpdateError::NoPendingUpdate)?;

    update.download_and_install(|_, _| {}, || {}).await?;

    app.restart();
}
