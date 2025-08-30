import { invoke } from "@tauri-apps/api/core";
import type {
  Scanner,
  ScannerCapabilities,
  ScanJob,
  ScanSettings,
  DocumentType,
  SystemType,
  ColorMode,
  PaperSize,
  OutputFormat,
  ScannerType,
  SystemInfo,
  ScanResult,
} from "../types/scanner";

export class ScannerApi {
  static async getSystemInfo(): Promise<SystemInfo> {
    console.log('ScannerApi: Calling get_system_info');
    const result = await invoke("get_system_info");
    console.log('ScannerApi: get_system_info result:', result);
    return result as SystemInfo;
  }

  static async getScanners(): Promise<Scanner[]> {
    console.log('ScannerApi: Calling get_scanners');
    const result = await invoke("get_scanners");
    console.log('ScannerApi: get_scanners result:', result);
    return result as Scanner[];
  }

  static async getScannersBySystem(systemType: SystemType): Promise<Scanner[]> {
    console.log('ScannerApi: Calling get_scanners_by_system with:', systemType);
    const result = await invoke("get_scanners_by_system", { systemType });
    console.log('ScannerApi: get_scanners_by_system result:', result);
    return result as Scanner[];
  }

  static async getScanner(scannerId: string): Promise<Scanner> {
    return await invoke("get_scanner", { scannerId });
  }

  static async getScannerCapabilities(
    scannerId: string
  ): Promise<ScannerCapabilities> {
    return await invoke("get_scanner_capabilities", { scannerId });
  }

  static async testScannerConnection(scannerId: string): Promise<boolean> {
    console.log('ScannerApi: Testing connection for scanner:', scannerId);
    const result = await invoke("test_scanner_connection", { scannerId });
    console.log('ScannerApi: test_scanner_connection result:', result);
    return result as boolean;
  }

  static async createScanJob(
    scannerId: string,
    documentType: DocumentType,
    scanSettings: ScanSettings
  ): Promise<string> {
    console.log('ScannerApi: Creating scan job with:', { scannerId, documentType, scanSettings });
    const result = await invoke("create_scan_job", {
      scannerId,
      documentType,
      scanSettings,
    });
    console.log('ScannerApi: create_scan_job result:', result);
    return result as string;
  }

  static async startScanJob(jobId: string): Promise<void> {
    console.log('ScannerApi: Starting scan job:', jobId);
    const result = await invoke("start_scan_job", { jobId });
    console.log('ScannerApi: start_scan_job completed');
    return result as void;
  }

  static async getScanJob(jobId: string): Promise<ScanJob> {
    console.log('ScannerApi: Getting scan job:', jobId);
    const result = await invoke("get_scan_job", { jobId });
    console.log('ScannerApi: get_scan_job result:', result);
    return result as ScanJob;
  }

  static async getAllJobs(): Promise<ScanJob[]> {
    return await invoke("get_all_jobs");
  }

  static async cancelScanJob(jobId: string): Promise<void> {
    return await invoke("cancel_scan_job", { jobId });
  }

  static async getDocumentTypes(): Promise<DocumentType[]> {
    return await invoke("get_document_types");
  }

  static async getColorModes(): Promise<ColorMode[]> {
    return await invoke("get_color_modes");
  }

  static async getPaperSizes(): Promise<PaperSize[]> {
    return await invoke("get_paper_sizes");
  }

  static async getOutputFormats(): Promise<OutputFormat[]> {
    return await invoke("get_output_formats");
  }

  static async getScannerTypes(): Promise<ScannerType[]> {
    return await invoke("get_scanner_types");
  }

  static async getDefaultScanSettings(): Promise<ScanSettings> {
    return await invoke("get_default_scan_settings");
  }

  static async openOutputDirectory(): Promise<string> {
    console.log('ScannerApi: Opening output directory');
    const result = await invoke("open_output_directory");
    console.log('ScannerApi: open_output_directory result:', result);
    return result as string;
  }

  static async getScanResult(jobId: string): Promise<ScanResult | null> {
    console.log('ScannerApi: Getting scan result for job:', jobId);
    const result = await invoke("get_scan_result", { jobId });
    console.log('ScannerApi: get_scan_result result:', result);
    return result as ScanResult | null;
  }

  static async previewScanFile(filePath: string): Promise<void> {
    console.log('ScannerApi: Previewing scan file:', filePath);
    await invoke("preview_scan_file", { filePath });
    console.log('ScannerApi: preview_scan_file completed');
  }

  static async discoverScanners(): Promise<Scanner[]> {
    console.log('ScannerApi: Discovering scanners...');
    const result = await invoke("discover_scanners");
    console.log('ScannerApi: discover_scanners result:', result);
    return result as Scanner[];
  }

  static async getAllScanners(): Promise<Scanner[]> {
    console.log('ScannerApi: Getting all scanners');
    const result = await invoke("get_all_scanners");
    console.log('ScannerApi: get_all_scanners result:', result);
    return result as Scanner[];
  }

  static async addScanner(scanner: Scanner): Promise<string> {
    console.log('ScannerApi: Adding scanner:', scanner);
    const result = await invoke("add_scanner", { scanner });
    console.log('ScannerApi: add_scanner result:', result);
    return result as string;
  }

  static async removeScanner(scannerId: string): Promise<void> {
    console.log('ScannerApi: Removing scanner:', scannerId);
    await invoke("remove_scanner", { scannerId });
    console.log('ScannerApi: remove_scanner completed');
  }

  static async simulateScannerEvents(): Promise<void> {
    console.log('ScannerApi: Simulating scanner events');
    await invoke("simulate_scanner_events");
    console.log('ScannerApi: simulate_scanner_events completed');
  }

  static async resetScannerStatus(scannerId: string): Promise<void> {
    console.log('ScannerApi: Resetting scanner status:', scannerId);
    await invoke("reset_scanner_status", { scannerId });
    console.log('ScannerApi: reset_scanner_status completed');
  }
}

// Helper functions for status and type checking
export const isJobActive = (job: ScanJob): boolean => {
  return (
    job.status === "Pending" ||
    job.status === "Scanning" ||
    job.status === "Processing"
  );
};

export const isJobCompleted = (job: ScanJob): boolean => {
  return job.status === "Completed";
};

export const isJobFailed = (job: ScanJob): boolean => {
  return typeof job.status === "object" && "Failed" in job.status;
};

export const isScannerAvailable = (scanner: Scanner): boolean => {
  return scanner.status === "Available";
};

export const getScannerStatusText = (scanner: Scanner): string => {
  if (typeof scanner.status === "string") {
    return scanner.status;
  }
  if (typeof scanner.status === "object" && "Error" in scanner.status) {
    return `Error: ${scanner.status.Error}`;
  }
  return "Unknown";
};

export const getJobStatusText = (job: ScanJob): string => {
  if (typeof job.status === "string") {
    return job.status;
  }
  if (typeof job.status === "object" && "Failed" in job.status) {
    return `Failed: ${job.status.Failed}`;
  }
  return "Unknown";
};

export const formatScannerType = (type: ScannerType): string => {
  switch (type) {
    case "DocumentFeeder":
      return "Document Feeder";
    case "SheetFed":
      return "Sheet Fed";
    case "FilmScanner":
      return "Film Scanner";
    case "PhotoScanner":
      return "Photo Scanner";
    default:
      return type;
  }
};

export const formatDocumentType = (type: DocumentType): string => {
  switch (type) {
    case "BusinessCard":
      return "Business Card";
    default:
      return type;
  }
};

export const formatColorMode = (mode: ColorMode): string => {
  switch (mode) {
    case "BlackAndWhite":
      return "Black & White";
    default:
      return mode;
  }
};

export const formatOutputFormat = (format: OutputFormat): string => {
  switch (format) {
    case "Jpeg":
      return "JPEG";
    case "Png":
      return "PNG";
    case "Tiff":
      return "TIFF";
    default:
      return format.toUpperCase();
  }
};

export const formatPaperSize = (size: PaperSize): string => {
  if (typeof size === "string") {
    return size;
  }
  if (typeof size === "object" && "Custom" in size) {
    return `Custom (${size.Custom.width}x${size.Custom.height})`;
  }
  return "Unknown";
};
