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

        println!("ScannerService initialized. Use discover_scanners() to detect system scanners.");
        service
    }

    // Scanner discovery is now handled by the discover_scanners() method
    // which simulates system-specific scanner detection APIs

    pub fn get_scanners(&self) -> Result<Vec<Scanner>, String> {
        let scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        let current_system = self.detect_platform();

        // Return scanners for the current system, but if none found, suggest discovery
        let system_scanners: Vec<Scanner> = scanners
            .values()
            .filter(|scanner| scanner.system_type == current_system)
            .cloned()
            .collect();

        if system_scanners.is_empty() {
            println!("No scanners found. Use discover_scanners() to detect system scanners.");
        }

        Ok(system_scanners)
    }

    pub fn get_all_scanners(&self) -> Result<Vec<Scanner>, String> {
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

    pub async fn discover_scanners(&self) -> Result<Vec<Scanner>, String> {
        // Simulate scanner discovery process with system detection delay
        sleep(Duration::from_millis(1500)).await;

        let current_system = self.detect_platform();
        println!("Discovering scanners for system: {:?}", current_system);

        // Clear existing scanners before discovery
        {
            let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;
            scanners.clear();
        } // Release lock before async operations

        // Discover scanners based on system type
        let discovered_scanners = match current_system {
            SystemType::Windows => {
                println!("Simulating WIA scanner discovery...");
                self.simulate_windows_discovery().await?
            }
            SystemType::MacOS => {
                println!("Simulating Image Capture framework discovery...");
                self.simulate_macos_discovery().await?
            }
            SystemType::Linux => {
                println!("Simulating SANE scanner discovery...");
                self.simulate_linux_discovery().await?
            }
        };

        // Add discovered scanners to the collection
        {
            let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;
            for scanner in &discovered_scanners {
                scanners.insert(scanner.id.clone(), scanner.clone());
            }
            println!("Discovery completed. Found {} scanners", scanners.len());
        }

        Ok(discovered_scanners)
    }

    async fn simulate_windows_discovery(&self) -> Result<Vec<Scanner>, String> {
        // Simulate WIA API calls with realistic delays
        let mut discovered = Vec::new();

        sleep(Duration::from_millis(300)).await;
        println!("Querying WIA device manager...");

        sleep(Duration::from_millis(200)).await;
        println!("Found WIA-compatible device: HP ScanJet Pro 2500 f1");
        let mut scanner1 = Scanner::new(
            "HP ScanJet Pro 2500 f1 (WIA)".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::Windows,
        );
        scanner1.capabilities.max_resolution = 1200;
        scanner1.capabilities.has_duplex = true;
        scanner1.capabilities.has_adf = true;
        discovered.push(scanner1);

        sleep(Duration::from_millis(200)).await;
        println!("Found WIA-compatible device: Canon CanoScan LiDE 400");
        let mut scanner2 = Scanner::new(
            "Canon CanoScan LiDE 400 (WIA)".to_string(),
            ScannerType::Flatbed,
            SystemType::Windows,
        );
        scanner2.capabilities.max_resolution = 4800;
        scanner2.capabilities.has_duplex = false;
        scanner2.capabilities.has_adf = false;
        discovered.push(scanner2);

        Ok(discovered)
    }

    async fn simulate_macos_discovery(&self) -> Result<Vec<Scanner>, String> {
        // Simulate Image Capture framework calls with realistic delays
        let mut discovered = Vec::new();

        sleep(Duration::from_millis(400)).await;
        println!("Querying Image Capture framework...");

        sleep(Duration::from_millis(250)).await;
        println!("Found Image Capture device: Brother MFC-L3770CDW");
        let mut scanner1 = Scanner::new(
            "Brother MFC-L3770CDW".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::MacOS,
        );
        scanner1.capabilities.max_resolution = 1200;
        scanner1.capabilities.has_duplex = true;
        scanner1.capabilities.has_adf = true;
        discovered.push(scanner1);

        sleep(Duration::from_millis(300)).await;
        println!("Found Image Capture device: Epson Perfection V850 Pro");
        let mut scanner2 = Scanner::new(
            "Epson Perfection V850 Pro".to_string(),
            ScannerType::PhotoScanner,
            SystemType::MacOS,
        );
        scanner2.capabilities.max_resolution = 6400;
        scanner2.capabilities.has_duplex = false;
        scanner2.capabilities.has_adf = false;
        discovered.push(scanner2);

        sleep(Duration::from_millis(200)).await;
        println!("Found Image Capture device: Canon imageFORMULA R40");
        let mut scanner3 = Scanner::new(
            "Canon imageFORMULA R40".to_string(),
            ScannerType::DocumentFeeder,
            SystemType::MacOS,
        );
        scanner3.capabilities.max_resolution = 600;
        scanner3.capabilities.has_duplex = true;
        scanner3.capabilities.has_adf = true;
        discovered.push(scanner3);

        Ok(discovered)
    }

    async fn simulate_linux_discovery(&self) -> Result<Vec<Scanner>, String> {
        // Simulate SANE API calls with realistic delays
        let mut discovered = Vec::new();

        sleep(Duration::from_millis(500)).await;
        println!("Querying SANE daemon...");

        sleep(Duration::from_millis(300)).await;
        println!("Found SANE device: HP LaserJet MFP M28w");
        let mut scanner1 = Scanner::new(
            "HP LaserJet MFP M28w (SANE)".to_string(),
            ScannerType::Flatbed,
            SystemType::Linux,
        );
        scanner1.capabilities.max_resolution = 1200;
        scanner1.capabilities.has_duplex = false;
        scanner1.capabilities.has_adf = false;
        discovered.push(scanner1);

        sleep(Duration::from_millis(250)).await;
        println!("Found SANE device: Epson ET-4850");
        let mut scanner2 = Scanner::new(
            "Epson ET-4850 (SANE)".to_string(),
            ScannerType::Flatbed,
            SystemType::Linux,
        );
        scanner2.capabilities.max_resolution = 1200;
        scanner2.capabilities.has_duplex = false;
        scanner2.capabilities.has_adf = true;
        discovered.push(scanner2);

        Ok(discovered)
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

    pub async fn add_scanner(&self, mut scanner: Scanner) -> Result<String, String> {
        // Validate scanner is for current system
        let current_system = self.detect_platform();
        if scanner.system_type != current_system {
            return Err(format!(
                "Scanner system type {:?} does not match current system {:?}",
                scanner.system_type, current_system
            ));
        }

        // Generate new ID if empty
        if scanner.id.is_empty() {
            scanner.id = uuid::Uuid::new_v4().to_string();
        }

        // Simulate device detection delay
        sleep(Duration::from_millis(300)).await;

        let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        let scanner_id = scanner.id.clone();
        scanners.insert(scanner_id.clone(), scanner);

        println!(
            "Added scanner: {} (ID: {})",
            scanners.get(&scanner_id).unwrap().name,
            scanner_id
        );
        Ok(scanner_id)
    }

    pub fn remove_scanner(&self, scanner_id: &str) -> Result<(), String> {
        let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;

        // Check if scanner has active jobs
        let active_jobs = self.get_active_jobs_for_scanner(scanner_id)?;
        if !active_jobs.is_empty() {
            return Err(format!(
                "Cannot remove scanner with {} active jobs. Cancel jobs first.",
                active_jobs.len()
            ));
        }

        match scanners.remove(scanner_id) {
            Some(scanner) => {
                println!("Removed scanner: {} (ID: {})", scanner.name, scanner_id);
                Ok(())
            }
            None => Err(format!("Scanner with ID {} not found", scanner_id)),
        }
    }

    fn get_active_jobs_for_scanner(&self, scanner_id: &str) -> Result<Vec<String>, String> {
        let jobs = self.jobs.lock().map_err(|e| e.to_string())?;
        Ok(jobs
            .values()
            .filter(|job| {
                job.scanner_id == scanner_id
                    && matches!(
                        job.status,
                        JobStatus::Pending | JobStatus::Scanning | JobStatus::Processing
                    )
            })
            .map(|job| job.id.clone())
            .collect())
    }

    pub async fn simulate_scanner_events(&self) -> Result<(), String> {
        // Simulate random scanner events (disconnect/reconnect)
        let mut rng = rand::thread_rng();

        if rng.gen::<f32>() < 0.1 {
            // 10% chance of scanner event
            let scanners = {
                let scanners_lock = self.scanners.lock().map_err(|e| e.to_string())?;
                scanners_lock.values().cloned().collect::<Vec<_>>()
            };

            if !scanners.is_empty() {
                let random_scanner = &scanners[rng.gen_range(0..scanners.len())];
                let event_type = rng.gen_range(0..3);

                match event_type {
                    0 => {
                        // Simulate scanner going offline
                        let mut scanners_lock = self.scanners.lock().map_err(|e| e.to_string())?;
                        if let Some(scanner) = scanners_lock.get_mut(&random_scanner.id) {
                            scanner.status = ScannerStatus::Offline;
                            println!("Scanner {} went offline", scanner.name);
                        }
                    }
                    1 => {
                        // Simulate scanner coming back online
                        let mut scanners_lock = self.scanners.lock().map_err(|e| e.to_string())?;
                        if let Some(scanner) = scanners_lock.get_mut(&random_scanner.id) {
                            if matches!(scanner.status, ScannerStatus::Offline) {
                                scanner.status = ScannerStatus::Available;
                                println!("Scanner {} came back online", scanner.name);
                            }
                        }
                    }
                    _ => {
                        // Simulate scanner error
                        let mut scanners_lock = self.scanners.lock().map_err(|e| e.to_string())?;
                        if let Some(scanner) = scanners_lock.get_mut(&random_scanner.id) {
                            scanner.status = ScannerStatus::Error("Paper jam detected".to_string());
                            println!("Scanner {} reported an error", scanner.name);
                        }
                    }
                }
            }
        }

        Ok(())
    }

    pub fn reset_scanner_status(&self, scanner_id: &str) -> Result<(), String> {
        let mut scanners = self.scanners.lock().map_err(|e| e.to_string())?;
        match scanners.get_mut(scanner_id) {
            Some(scanner) => {
                scanner.status = ScannerStatus::Available;
                println!("Reset scanner {} status to Available", scanner.name);
                Ok(())
            }
            None => Err(format!("Scanner with ID {} not found", scanner_id)),
        }
    }

    pub fn get_system_info(&self) -> SystemInfo {
        let current_platform = self.detect_platform();
        SystemInfo {
            platform: current_platform,
            available_scanners: self.get_scanners().unwrap_or_default().len(),
            total_scanners: self.get_all_scanners().unwrap_or_default().len(),
            active_jobs: self.get_active_jobs_count(),
            scanner_api: self.get_scanner_api_info(current_platform),
        }
    }

    fn get_scanner_api_info(&self, platform: SystemType) -> String {
        match platform {
            SystemType::Windows => "Windows Image Acquisition (WIA)".to_string(),
            SystemType::MacOS => "Image Capture Framework".to_string(),
            SystemType::Linux => "Scanner Access Now Easy (SANE)".to_string(),
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
    pub total_scanners: usize,
    pub active_jobs: usize,
    pub scanner_api: String,
}

impl Default for ScannerService {
    fn default() -> Self {
        Self::new()
    }
}
