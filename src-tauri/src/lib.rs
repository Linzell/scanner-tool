mod commands;
mod domain;
mod generators;
mod services;

use commands::*;
use services::ScannerService;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let scanner_service = ScannerService::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(scanner_service)
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_scanners,
            get_scanners_by_system,
            get_scanner,
            get_scanner_capabilities,
            test_scanner_connection,
            create_scan_job,
            start_scan_job,
            get_scan_job,
            get_all_jobs,
            cancel_scan_job,
            get_document_types,
            get_color_modes,
            get_paper_sizes,
            get_output_formats,
            get_scanner_types,
            get_default_scan_settings,
            open_output_directory,
            get_scan_result,
            preview_scan_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
