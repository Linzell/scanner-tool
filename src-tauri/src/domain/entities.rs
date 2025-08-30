use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scanner {
    pub id: String,
    pub name: String,
    pub scanner_type: ScannerType,
    pub status: ScannerStatus,
    pub capabilities: ScannerCapabilities,
    pub system_type: SystemType,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum ScannerType {
    Flatbed,
    DocumentFeeder,
    SheetFed,
    Handheld,
    FilmScanner,
    PhotoScanner,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScannerStatus {
    Available,
    Busy,
    Offline,
    Error(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScannerCapabilities {
    pub max_resolution: u32,
    pub color_modes: Vec<ColorMode>,
    pub paper_sizes: Vec<PaperSize>,
    pub has_duplex: bool,
    pub has_adf: bool, // Automatic Document Feeder
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum ColorMode {
    BlackAndWhite,
    Grayscale,
    Color,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PaperSize {
    A4,
    A3,
    Letter,
    Legal,
    Custom { width: u32, height: u32 },
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum SystemType {
    Windows,
    MacOS,
    Linux,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub name: String,
    pub doc_type: DocumentType,
    pub pages: u32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum DocumentType {
    Text,
    Image,
    Mixed,
    Photo,
    BusinessCard,
    Receipt,
    Contract,
    Invoice,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanJob {
    pub id: String,
    pub scanner_id: String,
    pub document_type: DocumentType,
    pub scan_settings: ScanSettings,
    pub status: JobStatus,
    pub progress: f32, // 0.0 to 1.0
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub completed_at: Option<chrono::DateTime<chrono::Utc>>,
    pub scan_result: Option<ScanResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanSettings {
    pub resolution: u32,
    pub color_mode: ColorMode,
    pub paper_size: PaperSize,
    pub duplex: bool,
    pub output_format: OutputFormat,
    pub quality: u8, // 1-100
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum OutputFormat {
    Pdf,
    Jpeg,
    Png,
    Tiff,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobStatus {
    Pending,
    Scanning,
    Processing,
    Completed,
    Failed(String),
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanAction {
    pub action_type: ActionType,
    pub parameters: HashMap<String, String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum ActionType {
    Scan,
    Preview,
    Cancel,
    GetScanners,
    GetCapabilities,
    TestConnection,
}

impl Default for ScanSettings {
    fn default() -> Self {
        Self {
            resolution: 300,
            color_mode: ColorMode::Color,
            paper_size: PaperSize::A4,
            duplex: false,
            output_format: OutputFormat::Pdf,
            quality: 85,
        }
    }
}

impl Scanner {
    pub fn new(name: String, scanner_type: ScannerType, system_type: SystemType) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            scanner_type,
            status: ScannerStatus::Available,
            capabilities: ScannerCapabilities::default(),
            system_type,
        }
    }

    pub fn is_available(&self) -> bool {
        matches!(self.status, ScannerStatus::Available)
    }
}

impl Default for ScannerCapabilities {
    fn default() -> Self {
        Self {
            max_resolution: 600,
            color_modes: vec![
                ColorMode::BlackAndWhite,
                ColorMode::Grayscale,
                ColorMode::Color,
            ],
            paper_sizes: vec![
                PaperSize::A4,
                PaperSize::A3,
                PaperSize::Letter,
                PaperSize::Legal,
            ],
            has_duplex: true,
            has_adf: false,
        }
    }
}

impl ScanJob {
    pub fn new(
        scanner_id: String,
        document_type: DocumentType,
        scan_settings: ScanSettings,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            scanner_id,
            document_type,
            scan_settings,
            status: JobStatus::Pending,
            progress: 0.0,
            created_at: chrono::Utc::now(),
            completed_at: None,
            scan_result: None,
        }
    }

    pub fn start_scanning(&mut self) {
        self.status = JobStatus::Scanning;
    }

    pub fn complete(&mut self) {
        self.status = JobStatus::Completed;
        self.progress = 1.0;
        self.completed_at = Some(chrono::Utc::now());
    }

    pub fn fail(&mut self, error: String) {
        self.status = JobStatus::Failed(error);
        self.completed_at = Some(chrono::Utc::now());
    }

    pub fn update_progress(&mut self, progress: f32) {
        self.progress = progress.clamp(0.0, 1.0);
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub file_path: std::path::PathBuf,
    pub file_size: u64,
    pub pages: u32,
    pub resolution: u32,
    pub color_mode: ColorMode,
    pub format: OutputFormat,
    pub scan_time: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanOutput {
    pub job_id: String,
    pub result: Option<ScanResult>,
    pub preview_available: bool,
    pub output_path: Option<std::path::PathBuf>,
}
