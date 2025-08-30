use crate::domain::*;
use crate::generators::ScanGenerator;
use rand::Rng;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::time::{sleep, Duration};

#[derive(Clone)]
pub struct ScannerService {
    scanners: Arc<Mutex<HashMap<String, Scanner>>>,
    jobs: Arc<Mutex<HashMap<String, ScanJob>>>,
}

impl ScannerService {
    pub fn new() -> Self {
        let service = Self {
            scanners: Arc::new(Mutex::new(HashMap::new())),
            jobs: Arc::new(Mutex::new(HashMap::new())),
        };

        // Initialize with mock scanners for demonstration
        service.initialize_mock_scanners();
        service
    }

    fn initialize_mock_scanners(&self) {
        let mut scanners = self.scanners.lock().unwrap();

        // Windows scanners
        let mut windows_scanner1 = Scanner::new(
            "HP ScanJet Pro 2500 f1".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::Windows,
        );
        windows_scanner1.capabilities.max_resolution = 1200;
        windows_scanner1.capabilities.has_duplex = true;
        windows_scanner1.capabilities.has_adf = true;

        let mut windows_scanner2 = Scanner::new(
            "Canon CanoScan LiDE 400".to_string(),
            ScannerType::Flatbed,
            SystemType::Windows,
        );
        windows_scanner2.capabilities.max_resolution = 4800;
        windows_scanner2.capabilities.has_duplex = false;
        windows_scanner2.capabilities.has_adf = false;

        // macOS scanners
        let mut macos_scanner1 = Scanner::new(
            "Epson Perfection V850 Pro".to_string(),
            ScannerType::PhotoScanner,
            SystemType::MacOS,
        );
        macos_scanner1.capabilities.max_resolution = 6400;
        macos_scanner1.capabilities.has_duplex = false;
        macos_scanner1.capabilities.has_adf = false;

        let mut macos_scanner2 = Scanner::new(
            "Brother MFC-L3770CDW".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::MacOS,
        );
        macos_scanner2.capabilities.max_resolution = 1200;
        macos_scanner2.capabilities.has_duplex = true;
        macos_scanner2.capabilities.has_adf = true;

        // Linux scanners
        let mut linux_scanner1 = Scanner::new(
            "HP LaserJet MFP M28w".to_string(),
            ScannerType::Flatbed,
            SystemType::Linux,
        );
        linux_scanner1.capabilities.max_resolution = 1200;
        linux_scanner1.capabilities.has_duplex = false;
        linux_scanner1.capabilities.has_adf = false;

        let mut linux_scanner2 = Scanner::new(
            "SANE Generic Scanner".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::Linux,
        );
        linux_scanner2.capabilities.max_resolution = 600;
        linux_scanner2.capabilities.has_duplex = true;
        linux_scanner2.capabilities.has_adf = true;

        scanners.insert(windows_scanner1.id.clone(), windows_scanner1);
        scanners.insert(windows_scanner2.id.clone(), windows_scanner2);
        scanners.insert(macos_scanner1.id.clone(), macos_scanner1);
        scanners.insert(macos_scanner2.id.clone(), macos_scanner2);
        scanners.insert(linux_scanner1.id.clone(), linux_scanner1);
        scanners.insert(linux_scanner2.id.clone(), linux_scanner2);
    }

    pub fn get_scanners(&self) -> Result<Vec<Scanner>, String> {
        let scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        Ok(scanners.values().cloned().collect())
    }

    pub fn get_scanners_by_system(&self, system_type: SystemType) -> Result<Vec<Scanner>, String> {
        let scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        Ok(scanners
            .values()
            .filter(|scanner| scanner.system_type == system_type)
            .cloned()
            .collect())
    }

    pub fn get_scanner(&self, scanner_id: &str) -> Result<Scanner, String> {
        let scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        scanners
            .get(scanner_id)
            .cloned()
            .ok_or_else(|| format!("Scanner with ID {} not found", scanner_id))
    }

    pub fn get_scanner_capabilities(
        &self,
        scanner_id: &str,
    ) -> Result<ScannerCapabilities, String> {
        let scanner = self.get_scanner(scanner_id)?;
        Ok(scanner.capabilities)
    }

    pub async fn test_scanner_connection(&self, scanner_id: &str) -> Result<bool, String> {
        let scanner = self.get_scanner(scanner_id)?;

        // Simulate connection test delay
        sleep(Duration::from_millis(500)).await;

        // Simulate random connection success/failure
        let mut rng = rand::thread_rng();
        let success_rate = match scanner.scanner_type {
            ScannerType::Flatbed => 0.95,
            ScannerType::DocumentFeeder => 0.90,
            ScannerType::SheetFed => 0.85,
            ScannerType::Handheld => 0.80,
            ScannerType::FilmScanner => 0.88,
            ScannerType::PhotoScanner => 0.92,
        };

        Ok(rng.gen::<f32>() < success_rate)
    }

    pub async fn create_scan_job(
        &self,
        scanner_id: String,
        document_type: DocumentType,
        scan_settings: ScanSettings,
    ) -> Result<String, String> {
        // Verify scanner exists and is available
        let scanner = self.get_scanner(&scanner_id)?;
        if !scanner.is_available() {
            return Err("Scanner is not available".to_string());
        }

        // Create new scan job
        let job = ScanJob::new(scanner_id, document_type, scan_settings);
        let job_id = job.id.clone();

        // Store the job
        let mut jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        jobs.insert(job_id.clone(), job);

        Ok(job_id)
    }

    pub async fn start_scan_job(&self, job_id: &str) -> Result<(), String> {
        let mut jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        let job = jobs
            .get_mut(job_id)
            .ok_or_else(|| format!("Job with ID {} not found", job_id))?;
        job.start_scanning();

        // Clone job data for async processing
        let job_clone = job.clone();
        let jobs_arc = Arc::clone(&self.jobs);
        let scanners_arc = Arc::clone(&self.scanners);

        // Spawn async task to simulate scanning process
        tokio::spawn(async move {
            Self::simulate_scanning_process(job_clone, jobs_arc, scanners_arc).await;
        });

        Ok(())
    }

    async fn simulate_scanning_process(
        job: ScanJob,
        jobs: Arc<Mutex<HashMap<String, ScanJob>>>,
        scanners: Arc<Mutex<HashMap<String, Scanner>>>,
    ) {
        // Set scanner to busy
        if let Ok(mut scanners_lock) = scanners.lock() {
            if let Some(scanner) = scanners_lock.get_mut(&job.scanner_id) {
                scanner.status = ScannerStatus::Busy;
            }
        }

        // Generate random values at the start to avoid Send issues
        let scan_duration_ms = {
            let mut rng = rand::thread_rng();
            rng.gen_range(3000..8000)
        };
        let should_fail = {
            let mut rng = rand::thread_rng();
            rng.gen::<f32>() < 0.05
        };

        let scan_duration = Duration::from_millis(scan_duration_ms);
        let steps = 20;
        let step_duration = scan_duration / steps;

        // Simulate scanning progress
        for step in 1..=steps {
            sleep(step_duration).await;

            let progress = step as f32 / steps as f32;

            // Update job progress
            if let Ok(mut jobs_lock) = jobs.lock() {
                if let Some(stored_job) = jobs_lock.get_mut(&job.id) {
                    stored_job.update_progress(progress);
                }
            }

            // Small chance of random failure
            if should_fail && step > 10 {
                println!("Simulating scanner failure for job: {}", job.id);
                if let Ok(mut jobs_lock) = jobs.lock() {
                    if let Some(stored_job) = jobs_lock.get_mut(&job.id) {
                        stored_job.fail("Scanner hardware error".to_string());
                    }
                }

                // Set scanner back to available
                if let Ok(mut scanners_lock) = scanners.lock() {
                    if let Some(scanner) = scanners_lock.get_mut(&job.scanner_id) {
                        println!(
                            "Setting scanner {} back to available after failure",
                            scanner.name
                        );
                        scanner.status = ScannerStatus::Available;
                    }
                }
                return;
            }
        }

        // Generate scan file
        println!("Generating scan file for job: {}", job.id);
        let output_dir = match ScanGenerator::get_output_directory() {
            Ok(dir) => dir,
            Err(e) => {
                println!("Failed to get output directory: {}", e);
                if let Ok(mut jobs_lock) = jobs.lock() {
                    if let Some(stored_job) = jobs_lock.get_mut(&job.id) {
                        stored_job.fail(format!("Failed to create output directory: {}", e));
                    }
                }
                return;
            }
        };

        let filename = ScanGenerator::generate_filename(
            &job.document_type,
            &job.scan_settings.output_format,
            &chrono::Utc::now(),
        );
        let output_path = output_dir.join(filename);

        let scan_result = match ScanGenerator::generate_scan_file(
            &job.document_type,
            &job.scan_settings,
            &output_path,
        )
        .await
        {
            Ok(result) => {
                println!("Scan file generated: {:?}", output_path);
                Some(result)
            }
            Err(e) => {
                println!("Failed to generate scan file: {}", e);
                if let Ok(mut jobs_lock) = jobs.lock() {
                    if let Some(stored_job) = jobs_lock.get_mut(&job.id) {
                        stored_job.fail(format!("Failed to generate file: {}", e));
                    }
                }
                return;
            }
        };

        // Complete the job
        println!("Completing scan job: {}", job.id);
        if let Ok(mut jobs_lock) = jobs.lock() {
            if let Some(stored_job) = jobs_lock.get_mut(&job.id) {
                stored_job.complete();
                stored_job.scan_result = scan_result;
            }
        }

        // Set scanner back to available
        if let Ok(mut scanners_lock) = scanners.lock() {
            if let Some(scanner) = scanners_lock.get_mut(&job.scanner_id) {
                println!(
                    "Setting scanner {} back to available after completion",
                    scanner.name
                );
                scanner.status = ScannerStatus::Available;
            }
        }
    }

    pub fn get_scan_job(&self, job_id: &str) -> Result<ScanJob, String> {
        let jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        jobs.get(job_id)
            .cloned()
            .ok_or_else(|| format!("Job with ID {} not found", job_id))
    }

    pub fn get_all_jobs(&self) -> Result<Vec<ScanJob>, String> {
        let jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        Ok(jobs.values().cloned().collect())
    }

    pub fn cancel_scan_job(&self, job_id: &str) -> Result<(), String> {
        let mut jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        let job = jobs
            .get_mut(job_id)
            .ok_or_else(|| format!("Job with ID {} not found", job_id))?;

        match job.status {
            JobStatus::Pending | JobStatus::Scanning | JobStatus::Processing => {
                job.status = JobStatus::Cancelled;
                job.completed_at = Some(chrono::Utc::now());

                // Set scanner back to available
                let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;
                if let Some(scanner) = scanners.get_mut(&job.scanner_id) {
                    scanner.status = ScannerStatus::Available;
                }

                Ok(())
            }
            _ => Err("Job cannot be cancelled in its current state".to_string()),
        }
    }

    pub fn get_system_info(&self) -> SystemInfo {
        SystemInfo {
            platform: self.detect_platform(),
            available_scanners: self.get_scanners().unwrap_or_default().len(),
            active_jobs: self.get_active_jobs_count(),
        }
    }

    fn detect_platform(&self) -> SystemType {
        #[cfg(target_os = "windows")]
        return SystemType::Windows;

        #[cfg(target_os = "macos")]
        return SystemType::MacOS;

        #[cfg(target_os = "linux")]
        return SystemType::Linux;
    }

    fn get_active_jobs_count(&self) -> usize {
        if let Ok(jobs) = self.jobs.lock() {
            jobs.values()
                .filter(|job| {
                    matches!(
                        job.status,
                        JobStatus::Pending | JobStatus::Scanning | JobStatus::Processing
                    )
                })
                .count()
        } else {
            0
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SystemInfo {
    pub platform: SystemType,
    pub available_scanners: usize,
    pub active_jobs: usize,
}

impl Default for ScannerService {
    fn default() -> Self {
        Self::new()
    }
}
