use crate::domain::*;
use crate::services::ScannerService;
use tauri::State;

#[tauri::command]
pub async fn get_system_info(
    scanner_service: State<'_, ScannerService>,
) -> Result<crate::services::SystemInfo, String> {
    Ok(scanner_service.get_system_info())
}

#[tauri::command]
pub async fn get_scanners(
    scanner_service: State<'_, ScannerService>,
) -> Result<Vec<Scanner>, String> {
    scanner_service.get_scanners()
}

#[tauri::command]
pub async fn get_scanners_by_system(
    system_type: SystemType,
    scanner_service: State<'_, ScannerService>,
) -> Result<Vec<Scanner>, String> {
    scanner_service.get_scanners_by_system(system_type)
}

#[tauri::command]
pub async fn get_scanner(
    scanner_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<Scanner, String> {
    scanner_service.get_scanner(&scanner_id)
}

#[tauri::command]
pub async fn get_scanner_capabilities(
    scanner_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<ScannerCapabilities, String> {
    scanner_service.get_scanner_capabilities(&scanner_id)
}

#[tauri::command]
pub async fn test_scanner_connection(
    scanner_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<bool, String> {
    scanner_service.test_scanner_connection(&scanner_id).await
}

#[tauri::command]
pub async fn create_scan_job(
    scanner_id: String,
    document_type: DocumentType,
    scan_settings: ScanSettings,
    scanner_service: State<'_, ScannerService>,
) -> Result<String, String> {
    scanner_service
        .create_scan_job(scanner_id, document_type, scan_settings)
        .await
}

#[tauri::command]
pub async fn start_scan_job(
    job_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<(), String> {
    scanner_service.start_scan_job(&job_id).await
}

#[tauri::command]
pub async fn get_scan_job(
    job_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<ScanJob, String> {
    scanner_service.get_scan_job(&job_id)
}

#[tauri::command]
pub async fn get_all_jobs(
    scanner_service: State<'_, ScannerService>,
) -> Result<Vec<ScanJob>, String> {
    scanner_service.get_all_jobs()
}

#[tauri::command]
pub async fn cancel_scan_job(
    job_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<(), String> {
    scanner_service.cancel_scan_job(&job_id)
}

#[tauri::command]
pub async fn get_document_types() -> Result<Vec<DocumentType>, String> {
    Ok(vec![
        DocumentType::Text,
        DocumentType::Image,
        DocumentType::Mixed,
        DocumentType::Photo,
        DocumentType::BusinessCard,
        DocumentType::Receipt,
        DocumentType::Contract,
        DocumentType::Invoice,
    ])
}

#[tauri::command]
pub async fn get_color_modes() -> Result<Vec<ColorMode>, String> {
    Ok(vec![
        ColorMode::BlackAndWhite,
        ColorMode::Grayscale,
        ColorMode::Color,
    ])
}

#[tauri::command]
pub async fn get_paper_sizes() -> Result<Vec<PaperSize>, String> {
    Ok(vec![
        PaperSize::A4,
        PaperSize::A3,
        PaperSize::Letter,
        PaperSize::Legal,
    ])
}

#[tauri::command]
pub async fn get_output_formats() -> Result<Vec<OutputFormat>, String> {
    Ok(vec![
        OutputFormat::Pdf,
        OutputFormat::Jpeg,
        OutputFormat::Png,
        OutputFormat::Tiff,
    ])
}

#[tauri::command]
pub async fn get_scanner_types() -> Result<Vec<ScannerType>, String> {
    Ok(vec![
        ScannerType::Flatbed,
        ScannerType::DocumentFeeder,
        ScannerType::SheetFed,
        ScannerType::Handheld,
        ScannerType::FilmScanner,
        ScannerType::PhotoScanner,
    ])
}

#[tauri::command]
pub async fn get_default_scan_settings() -> Result<ScanSettings, String> {
    Ok(ScanSettings::default())
}

#[tauri::command]
pub async fn open_output_directory() -> Result<String, String> {
    use crate::generators::ScanGenerator;

    let output_dir = ScanGenerator::get_output_directory()?;

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&output_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&output_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&output_dir)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    Ok(format!("Opened directory: {}", output_dir.display()))
}

#[tauri::command]
pub async fn get_scan_result(
    job_id: String,
    scanner_service: State<'_, ScannerService>,
) -> Result<Option<ScanResult>, String> {
    let job = scanner_service.get_scan_job(&job_id)?;
    Ok(job.scan_result)
}

#[tauri::command]
pub async fn preview_scan_file(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);

    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(&["/c", "start", "", &file_path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    Ok(())
}
