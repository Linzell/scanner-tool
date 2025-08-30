# Scanner Tool - Cross-Platform Scanner Simulator

A Tauri-based desktop application that simulates scanner functionality across Windows, macOS, and Linux platforms. This tool is designed to help test scanner integration workflows without requiring physical scanner hardware.

![Scanner Tool Screenshot](https://via.placeholder.com/800x600?text=Scanner+Tool+Interface)

## Features

### 🖥️ Cross-Platform Support
- **Windows**: Simulates common Windows scanner drivers
- **macOS**: Integrates with macOS scanner frameworks  
- **Linux**: Supports SANE-compatible scanner simulation

### 🔍 Scanner Simulation
- **Multiple Scanner Types**: Flatbed, Document Feeder, Sheet Fed, Handheld, Film, Photo
- **Realistic Capabilities**: Resolution settings, color modes, paper sizes, duplex support
- **Connection Testing**: Simulate scanner connectivity and status checks
- **Progress Tracking**: Real-time scan progress simulation with realistic timing

### 📄 Document Type Support
- Text Documents
- Images & Photos
- Mixed Content
- Business Cards
- Receipts
- Contracts
- Invoices

### ⚙️ Configurable Scan Settings
- **Resolution**: 150-2400 DPI
- **Color Modes**: Black & White, Grayscale, Color
- **Paper Sizes**: A4, A3, Letter, Legal, Custom
- **Output Formats**: PDF, JPEG, PNG, TIFF
- **Quality Control**: Adjustable quality settings (10-100%)
- **Duplex Scanning**: Automatic both-sides scanning simulation

## Technology Stack

### Backend (Rust)
- **Tauri 2.x**: Cross-platform app framework
- **Tokio**: Async runtime for scan simulation
- **Serde**: JSON serialization
- **UUID**: Unique job and scanner identification
- **Chrono**: Timestamp management
- **Rand**: Realistic scanning behavior simulation

### Frontend (React + TypeScript)
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tanstack Query**: State management and caching
- **Lucide React**: Modern icon library
- **Custom CSS**: Lightweight styling system

## Architecture

### Domain-Driven Design (DDD)
```
src-tauri/src/
├── domain/           # Core business entities
│   ├── entities.rs   # Scanner, ScanJob, Document types
│   └── mod.rs
├── services/         # Business logic layer  
│   ├── scanner_service.rs  # Scanner operations
│   └── mod.rs
├── commands/         # Tauri command handlers
│   ├── scanner_commands.rs  # Frontend API
│   └── mod.rs
└── lib.rs           # Application setup
```

### Frontend Component Structure
```
src/
├── components/       # UI components
│   ├── SystemSelector.tsx
│   ├── ScannerSelector.tsx  
│   ├── DocumentTypeSelector.tsx
│   ├── ScanSettings.tsx
│   └── ScanActions.tsx
├── services/         # API integration
│   └── scannerApi.ts
├── types/           # TypeScript definitions
│   └── scanner.ts
└── App.tsx         # Main application
```

## Installation & Setup

### Prerequisites
- **Rust** 1.70+
- **Node.js** 18+
- **pnpm** (recommended) or npm

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd scanner-tool

# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

### Building for Production
```bash
# Build the application
pnpm tauri build

# Output will be in src-tauri/target/release/bundle/
```

## Usage

### 1. System Selection
Choose your operating system (Windows, macOS, or Linux) to load appropriate scanner simulations.

### 2. Scanner Selection  
Browse available scanners for your selected system. Each scanner includes:
- Scanner type and capabilities
- Connection status
- Test connection functionality

### 3. Document Type Selection
Choose from various document types that affect scan optimization:
- Text documents (OCR-optimized)
- Photos (high-quality color)
- Business cards (small format)
- Receipts (thermal paper simulation)

### 4. Scan Configuration
Adjust scan settings based on your needs:
- **Resolution**: Higher = better quality, larger files
- **Color Mode**: B&W for text, Color for photos
- **Paper Size**: Standard sizes or custom dimensions
- **Output Format**: PDF for documents, JPEG for photos
- **Quality**: Balance between file size and image quality

### 5. Scan Execution
- Start scan jobs with real-time progress tracking
- Cancel operations mid-scan
- View job status and completion details

## API Reference

### Core Types
```typescript
interface Scanner {
  id: string;
  name: string;
  scanner_type: ScannerType;
  status: ScannerStatus;
  capabilities: ScannerCapabilities;
  system_type: SystemType;
}

interface ScanJob {
  id: string;
  scanner_id: string;
  document_type: DocumentType;
  scan_settings: ScanSettings;
  status: JobStatus;
  progress: number; // 0.0 to 1.0
}
```

### Main Commands
- `get_scanners()`: List all available scanners
- `get_scanners_by_system(SystemType)`: Filter by OS
- `test_scanner_connection(scanner_id)`: Connection test
- `create_scan_job(scanner_id, doc_type, settings)`: Create scan
- `start_scan_job(job_id)`: Begin scanning
- `get_scan_job(job_id)`: Check scan status
- `cancel_scan_job(job_id)`: Stop scanning

## Configuration

### Mock Scanner Data
Scanners are pre-configured in `scanner_service.rs` with realistic capabilities:

```rust
// Windows scanners
"HP ScanJet Pro 2500 f1" - Document Feeder
"Canon CanoScan LiDE 400" - Flatbed

// macOS scanners  
"Epson Perfection V850 Pro" - Photo Scanner
"Brother MFC-L3770CDW" - Document Feeder
```

### Scan Simulation
- **Duration**: 3-8 seconds (randomized)
- **Progress**: 20 steps with realistic timing
- **Failure Rate**: ~5% chance for testing error handling
- **Status Updates**: Real-time progress via polling

## Development

### Code Quality
- **Rust**: Clippy linting, error handling patterns
- **TypeScript**: Strict mode, comprehensive types
- **Architecture**: Clean separation of concerns
- **Testing**: Component and integration test structure

### Adding New Scanners
1. Update `initialize_mock_scanners()` in `scanner_service.rs`
2. Define scanner capabilities and system type
3. Add to scanner type mappings if needed

### Extending Document Types
1. Add new variant to `DocumentType` enum
2. Update UI labels in `formatDocumentType()`
3. Add icon mapping in `DocumentTypeSelector`

## Troubleshooting

### Common Issues
- **Build Errors**: Ensure Rust toolchain is up to date
- **Scanner Not Found**: Check system type selection matches OS
- **Slow Performance**: Reduce polling frequency in scan job queries
- **UI Issues**: Clear browser cache, check console for errors

### Debug Mode
```bash
# Enable Rust debug logging
RUST_LOG=debug pnpm tauri dev

# Enable development tools
pnpm tauri dev --debug
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- **Rust**: Follow `rustfmt` formatting
- **TypeScript**: Use Prettier for formatting
- **Commits**: Conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Tauri Team**: Cross-platform app framework
- **React Team**: Frontend framework
- **Lucide**: Beautiful icon library
- **Scanner Industry**: Inspiration for realistic simulation features

---

**Note**: This is a simulation tool for development and testing purposes. It does not interact with physical scanner hardware.