export interface Scanner {
  id: string;
  name: string;
  scanner_type: ScannerType;
  status: ScannerStatus;
  capabilities: ScannerCapabilities;
  system_type: SystemType;
}

export type ScannerType =
  | "Flatbed"
  | "DocumentFeeder"
  | "SheetFed"
  | "Handheld"
  | "FilmScanner"
  | "PhotoScanner";

export type ScannerStatus =
  | "Available"
  | "Busy"
  | "Offline"
  | { Error: string };

export interface ScannerCapabilities {
  max_resolution: number;
  color_modes: ColorMode[];
  paper_sizes: PaperSize[];
  has_duplex: boolean;
  has_adf: boolean;
}

export type ColorMode =
  | "BlackAndWhite"
  | "Grayscale"
  | "Color";

export type PaperSize =
  | "A4"
  | "A3"
  | "Letter"
  | "Legal"
  | { Custom: { width: number; height: number } };

export type SystemType =
  | "Windows"
  | "MacOS"
  | "Linux";

export interface Document {
  id: string;
  name: string;
  doc_type: DocumentType;
  pages: number;
  created_at: string;
}

export type DocumentType =
  | "Text"
  | "Image"
  | "Mixed"
  | "Photo"
  | "BusinessCard"
  | "Receipt"
  | "Contract"
  | "Invoice";

export interface ScanJob {
  id: string;
  scanner_id: string;
  document_type: DocumentType;
  scan_settings: ScanSettings;
  status: JobStatus;
  progress: number;
  created_at: string;
  completed_at: string | null;
  scan_result: ScanResult | null;
}

export interface ScanSettings {
  resolution: number;
  color_mode: ColorMode;
  paper_size: PaperSize;
  duplex: boolean;
  output_format: OutputFormat;
  quality: number;
}

export type OutputFormat =
  | "Pdf"
  | "Jpeg"
  | "Png"
  | "Tiff";

export type JobStatus =
  | "Pending"
  | "Scanning"
  | "Processing"
  | "Completed"
  | { Failed: string }
  | "Cancelled";

export interface ScanAction {
  action_type: ActionType;
  parameters: Record<string, string>;
}

export type ActionType =
  | "Scan"
  | "Preview"
  | "Cancel"
  | "GetScanners"
  | "GetCapabilities"
  | "TestConnection";

export interface ScanResult {
  file_path: string;
  file_size: number;
  pages: number;
  resolution: number;
  color_mode: ColorMode;
  format: OutputFormat;
  scan_time: string;
}

export interface SystemInfo {
  platform: SystemType;
  available_scanners: number;
  active_jobs: number;
}

// UI specific types
export interface ScannerFormData {
  scannerId: string;
  documentType: DocumentType;
  settings: ScanSettings;
}

export interface ScannerUIState {
  selectedSystem: SystemType | null;
  selectedScanner: Scanner | null;
  selectedDocumentType: DocumentType | null;
  scanSettings: ScanSettings;
  currentJob: ScanJob | null;
}
