use crate::domain::*;
use printpdf::*;
use rand::Rng;
use std::fs;
use std::io::BufWriter;
use std::path::PathBuf;

pub struct ScanGenerator;

impl ScanGenerator {
    /// Generate a realistic scan file based on document type and settings
    pub async fn generate_scan_file(
        document_type: &DocumentType,
        settings: &ScanSettings,
        output_path: &PathBuf,
    ) -> Result<ScanResult, String> {
        match settings.output_format {
            OutputFormat::Pdf => Self::generate_pdf(document_type, settings, output_path).await,
            _ => Self::generate_text_file(document_type, settings, output_path).await,
        }
    }

    async fn generate_pdf(
        document_type: &DocumentType,
        settings: &ScanSettings,
        output_path: &PathBuf,
    ) -> Result<ScanResult, String> {
        let (doc, page1, layer1) = PdfDocument::new(
            "Scanned Document",
            Mm(210.0), // A4 width
            Mm(297.0), // A4 height
            "Layer 1",
        );

        let font = doc
            .add_builtin_font(BuiltinFont::TimesRoman)
            .map_err(|e| format!("Failed to add font: {}", e))?;

        let current_layer = doc.get_page(page1).get_layer(layer1);

        // Generate content based on document type
        match document_type {
            DocumentType::Text => {
                Self::add_text_content(&current_layer, &font)?;
            }
            DocumentType::Invoice => {
                Self::add_invoice_content(&current_layer, &font)?;
            }
            DocumentType::Contract => {
                Self::add_contract_content(&current_layer, &font)?;
            }
            DocumentType::Receipt => {
                Self::add_receipt_content(&current_layer, &font)?;
            }
            DocumentType::BusinessCard => {
                Self::add_business_card_content(&current_layer, &font)?;
            }
            _ => {
                Self::add_generic_content(&current_layer, &font, document_type)?;
            }
        }

        // Save PDF
        doc.save(&mut BufWriter::new(
            std::fs::File::create(output_path)
                .map_err(|e| format!("Failed to create PDF file: {}", e))?,
        ))
        .map_err(|e| format!("Failed to save PDF: {}", e))?;

        let file_size = std::fs::metadata(output_path)
            .map_err(|e| format!("Failed to get file size: {}", e))?
            .len();

        Ok(ScanResult {
            file_path: output_path.clone(),
            file_size,
            pages: 1,
            resolution: settings.resolution,
            color_mode: settings.color_mode,
            format: settings.output_format,
            scan_time: chrono::Utc::now(),
        })
    }

    async fn generate_text_file(
        document_type: &DocumentType,
        settings: &ScanSettings,
        output_path: &PathBuf,
    ) -> Result<ScanResult, String> {
        let content = Self::generate_text_content(document_type, settings);

        // Change extension to .txt for non-PDF formats
        let mut text_path = output_path.clone();
        text_path.set_extension("txt");

        fs::write(&text_path, content).map_err(|e| format!("Failed to write text file: {}", e))?;

        let file_size = std::fs::metadata(&text_path)
            .map_err(|e| format!("Failed to get file size: {}", e))?
            .len();

        Ok(ScanResult {
            file_path: text_path,
            file_size,
            pages: 1,
            resolution: settings.resolution,
            color_mode: settings.color_mode,
            format: settings.output_format,
            scan_time: chrono::Utc::now(),
        })
    }

    fn generate_text_content(document_type: &DocumentType, settings: &ScanSettings) -> String {
        let quality_note = format!(
            "\n[Scanned at {} DPI, {} quality, {} mode]\n\n",
            settings.resolution,
            settings.quality,
            match settings.color_mode {
                ColorMode::BlackAndWhite => "B&W",
                ColorMode::Grayscale => "Grayscale",
                ColorMode::Color => "Color",
            }
        );

        match document_type {
            DocumentType::Text => format!(
                "MEMORANDUM{}\
                TO: Development Team\n\
                FROM: Scanner Tool Project Manager\n\
                DATE: {}\n\
                RE: Scanner Tool Implementation Test\n\n\
                This document serves as a test of the scanner simulation functionality.\n\n\
                The implementation includes:\n\
                • Document type recognition\n\
                • Multiple output formats (PDF, JPEG, PNG, TIFF)\n\
                • Realistic scan quality simulation\n\
                • File generation capabilities\n\
                • Cross-platform scanner detection\n\n\
                Scanner Settings Used:\n\
                - Resolution: {} DPI\n\
                - Color Mode: {:?}\n\
                - Paper Size: {:?}\n\
                - Output Format: {:?}\n\
                - Quality: {}%\n\
                - Duplex: {}\n\n\
                Please review and provide feedback on the scanning functionality.\n\n\
                Best regards,\n\
                Scanner Tool Team",
                quality_note,
                chrono::Utc::now().format("%Y-%m-%d"),
                settings.resolution,
                settings.color_mode,
                settings.paper_size,
                settings.output_format,
                settings.quality,
                if settings.duplex { "Yes" } else { "No" }
            ),

            DocumentType::Invoice => format!(
                "INVOICE{}\
                Invoice #: INV-{}\n\
                Date: {}\n\
                Due Date: {}\n\n\
                BILL TO:\n\
                Scanner Tool Test Customer\n\
                123 Business Street\n\
                Technology City, TC 12345\n\
                United States\n\n\
                DESCRIPTION                    QTY    RATE      AMOUNT\n\
                ================================================\n\
                Scanner Tool License            1    $299.00   $299.00\n\
                Technical Support (5 hrs)      5     $50.00   $250.00\n\
                Implementation Services         1    $150.00   $150.00\n\
                ================================================\n\
                                          SUBTOTAL:   $699.00\n\
                                          TAX (8.5%):  $59.42\n\
                                          TOTAL:      $758.42\n\n\
                Payment Terms: Net 30 days\n\
                Thank you for your business!",
                quality_note,
                rand::thread_rng().gen_range(10000..99999),
                chrono::Utc::now().format("%Y-%m-%d"),
                (chrono::Utc::now() + chrono::Duration::days(30)).format("%Y-%m-%d")
            ),

            DocumentType::Contract => format!(
                "SOFTWARE LICENSE AGREEMENT{}\
                This Software License Agreement ('Agreement') is entered into\n\
                between Scanner Tool Corporation ('Licensor') and the end user\n\
                ('Licensee') effective as of {}.\n\n\
                1. GRANT OF LICENSE\n\
                Licensor hereby grants to Licensee a non-exclusive, non-transferable\n\
                license to use the Scanner Tool software in accordance with the terms\n\
                and conditions set forth herein.\n\n\
                2. PERMITTED USES\n\
                Licensee may:\n\
                (a) Install and use the software on authorized devices\n\
                (b) Create backup copies for archival purposes\n\
                (c) Use the software for legitimate business purposes\n\n\
                3. RESTRICTIONS\n\
                Licensee may not:\n\
                (a) Modify, adapt, or create derivative works\n\
                (b) Reverse engineer, decompile, or disassemble\n\
                (c) Distribute, sublicense, or transfer rights\n\n\
                4. TERMINATION\n\
                This Agreement terminates automatically if Licensee breaches\n\
                any term hereof. Upon termination, Licensee must destroy all\n\
                copies of the software.\n\n\
                5. WARRANTY DISCLAIMER\n\
                THE SOFTWARE IS PROVIDED 'AS IS' WITHOUT WARRANTY OF ANY KIND.\n\n\
                Signature: ________________________________\n\
                Date: ____________________________________\n\
                Print Name: _______________________________",
                quality_note,
                chrono::Utc::now().format("%B %d, %Y")
            ),

            DocumentType::Receipt => format!(
                "        TECH STORE RECEIPT{}\
                    123 Technology Avenue\n\
                       Silicon Valley, CA\n\
                      Phone: (555) 123-4567\n\
                =============================\n\n\
                Date: {}\n\
                Time: {}\n\
                Cashier: Alex T.\n\
                Transaction #: TX-{}\n\n\
                ITEMS PURCHASED:\n\
                Scanner Tool Software License\n\
                SKU: SW-SCAN-001\n\
                Price: $299.00\n\n\
                Extended Warranty (1 Year)\n\
                SKU: WR-001\n\
                Price: $49.99\n\n\
                Installation Service\n\
                SKU: SV-INSTALL\n\
                Price: $75.00\n\n\
                -----------------------------\n\
                Subtotal:              $423.99\n\
                Tax (8.75%):            $37.10\n\
                TOTAL:                 $461.09\n\n\
                Payment Method: Credit Card\n\
                Card: ****1234 (VISA)\n\
                Authorization: ABC123\n\n\
                THANK YOU FOR YOUR PURCHASE!\n\
                \n\
                Return Policy: 30 days with receipt\n\
                Customer Service: support@techstore.com",
                quality_note,
                chrono::Utc::now().format("%Y-%m-%d"),
                chrono::Utc::now().format("%H:%M:%S"),
                rand::thread_rng().gen_range(100000..999999)
            ),

            DocumentType::BusinessCard => format!(
                "BUSINESS CARD{}\
                ═══════════════════════════════════════\n\
                           JOHN SMITH\n\
                        Senior Developer\n\n\
                      Scanner Tool Corp.\n\n\
                   📧 john.smith@scantech.com\n\
                   📱 +1 (555) 123-4567\n\
                   🌐 www.scannertool.com\n\n\
                   LinkedIn: /in/johnsmith-dev\n\
                   GitHub: @johnsmith-scanner\n\n\
                ═══════════════════════════════════════\n\
                  'Scanning the future, one document\n\
                           at a time.'",
                quality_note
            ),

            DocumentType::Photo => format!(
                "PHOTO SCAN METADATA{}\
                Original Photo Details:\n\
                - Scanned: {}\n\
                - Resolution: {} DPI\n\
                - Color Mode: {:?}\n\
                - Estimated Size: 4x6 inches\n\
                - File Format: {:?}\n\n\
                Photo Description:\n\
                This represents a scanned photograph. In a real implementation,\n\
                this would be an actual image file containing the photographed\n\
                content with appropriate color reproduction and detail.\n\n\
                Scan Quality Notes:\n\
                - Dust removal: Applied\n\
                - Color correction: Auto\n\
                - Sharpening: Moderate\n\
                - Noise reduction: {}%",
                quality_note,
                chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
                settings.resolution,
                settings.color_mode,
                settings.output_format,
                settings.quality
            ),

            _ => format!(
                "SCANNED DOCUMENT{}\
                Document Type: {:?}\n\
                Scan Date: {}\n\
                Scanner: Simulated Scanner\n\n\
                This is a generic scanned document created by the Scanner Tool\n\
                simulation system. In a real scanning scenario, this would contain\n\
                the actual content from the physical document.\n\n\
                Scan Parameters:\n\
                - Resolution: {} DPI\n\
                - Color Mode: {:?}\n\
                - Paper Size: {:?}\n\
                - Quality: {}%\n\
                - Duplex: {}\n\
                - Output Format: {:?}\n\n\
                File Information:\n\
                - Generated by: Scanner Tool v1.0\n\
                - Platform: Cross-platform scanner simulator\n\
                - Purpose: Development and testing tool",
                quality_note,
                document_type,
                chrono::Utc::now().format("%Y-%m-%d %H:%M:%S"),
                settings.resolution,
                settings.color_mode,
                settings.paper_size,
                settings.quality,
                if settings.duplex { "Yes" } else { "No" },
                settings.output_format
            ),
        }
    }

    pub fn generate_filename(
        document_type: &DocumentType,
        format: &OutputFormat,
        timestamp: &chrono::DateTime<chrono::Utc>,
    ) -> String {
        let type_prefix = match document_type {
            DocumentType::Text => "text_document",
            DocumentType::Image => "scanned_image",
            DocumentType::Mixed => "mixed_content",
            DocumentType::Photo => "photo_scan",
            DocumentType::BusinessCard => "business_card",
            DocumentType::Receipt => "receipt",
            DocumentType::Contract => "contract",
            DocumentType::Invoice => "invoice",
        };

        let extension = match format {
            OutputFormat::Pdf => "pdf",
            OutputFormat::Jpeg => "txt", // Simplified to txt for now
            OutputFormat::Png => "txt",
            OutputFormat::Tiff => "txt",
        };

        format!(
            "{}_{}.{}",
            type_prefix,
            timestamp.format("%Y%m%d_%H%M%S"),
            extension
        )
    }

    pub fn get_output_directory() -> Result<PathBuf, String> {
        let documents_dir = dirs::document_dir().ok_or("Could not find documents directory")?;
        let scan_dir = documents_dir.join("Scanner Tool Outputs");

        if !scan_dir.exists() {
            fs::create_dir_all(&scan_dir)
                .map_err(|e| format!("Failed to create output directory: {}", e))?;
        }

        Ok(scan_dir)
    }

    // PDF-specific content generation helpers
    fn add_text_content(layer: &PdfLayerReference, font: &IndirectFontRef) -> Result<(), String> {
        layer.use_text("MEMORANDUM", 18.0, Mm(20.0), Mm(250.0), font);
        layer.use_text("TO: Development Team", 12.0, Mm(20.0), Mm(230.0), font);
        layer.use_text(
            "FROM: Scanner Tool Project Manager",
            12.0,
            Mm(20.0),
            Mm(220.0),
            font,
        );
        layer.use_text("DATE: Today's Date", 12.0, Mm(20.0), Mm(210.0), font);
        layer.use_text(
            "RE: Scanner Tool Implementation",
            12.0,
            Mm(20.0),
            Mm(200.0),
            font,
        );

        layer.use_text(
            "This document serves as a test of the scanner simulation functionality.",
            10.0,
            Mm(20.0),
            Mm(180.0),
            font,
        );
        layer.use_text(
            "The implementation includes document type recognition, multiple output formats,",
            10.0,
            Mm(20.0),
            Mm(170.0),
            font,
        );
        layer.use_text(
            "realistic scan quality simulation, and file generation capabilities.",
            10.0,
            Mm(20.0),
            Mm(160.0),
            font,
        );

        Ok(())
    }

    fn add_invoice_content(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
    ) -> Result<(), String> {
        layer.use_text("INVOICE", 24.0, Mm(20.0), Mm(270.0), font);
        layer.use_text("Invoice #: INV-2024-001", 12.0, Mm(20.0), Mm(250.0), font);
        layer.use_text("Date: 2024-01-15", 12.0, Mm(20.0), Mm(240.0), font);

        layer.use_text("Bill To:", 12.0, Mm(20.0), Mm(220.0), font);
        layer.use_text(
            "Scanner Tool Test Customer",
            10.0,
            Mm(20.0),
            Mm(210.0),
            font,
        );
        layer.use_text("123 Business Street", 10.0, Mm(20.0), Mm(200.0), font);
        layer.use_text("Technology City, TC 12345", 10.0, Mm(20.0), Mm(190.0), font);

        layer.use_text(
            "Scanner Tool License    $299.00",
            10.0,
            Mm(20.0),
            Mm(160.0),
            font,
        );
        layer.use_text(
            "Technical Support       $250.00",
            10.0,
            Mm(20.0),
            Mm(150.0),
            font,
        );
        layer.use_text("TOTAL: $598.41", 14.0, Mm(20.0), Mm(120.0), font);

        Ok(())
    }

    fn add_contract_content(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
    ) -> Result<(), String> {
        layer.use_text(
            "SOFTWARE LICENSE AGREEMENT",
            18.0,
            Mm(20.0),
            Mm(270.0),
            font,
        );
        layer.use_text(
            "This Software License Agreement ('Agreement') is entered into",
            10.0,
            Mm(20.0),
            Mm(250.0),
            font,
        );
        layer.use_text(
            "between Scanner Tool Corp. ('Licensor') and the end user ('Licensee').",
            10.0,
            Mm(20.0),
            Mm(240.0),
            font,
        );

        layer.use_text("1. GRANT OF LICENSE", 12.0, Mm(20.0), Mm(210.0), font);
        layer.use_text(
            "Licensor hereby grants to Licensee a non-exclusive, non-transferable",
            10.0,
            Mm(20.0),
            Mm(200.0),
            font,
        );
        layer.use_text(
            "license to use the Scanner Tool software in accordance with the terms herein.",
            10.0,
            Mm(20.0),
            Mm(190.0),
            font,
        );

        Ok(())
    }

    fn add_receipt_content(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
    ) -> Result<(), String> {
        layer.use_text("TECH STORE RECEIPT", 14.0, Mm(60.0), Mm(270.0), font);
        layer.use_text("123 Technology Avenue", 10.0, Mm(65.0), Mm(260.0), font);
        layer.use_text("Phone: (555) 123-4567", 10.0, Mm(70.0), Mm(250.0), font);

        layer.use_text("Date: 2024-01-15 14:32", 10.0, Mm(20.0), Mm(220.0), font);
        layer.use_text(
            "Scanner Tool Software    $299.00",
            10.0,
            Mm(20.0),
            Mm(200.0),
            font,
        );
        layer.use_text(
            "Tax (8.25%):              $24.67",
            10.0,
            Mm(20.0),
            Mm(180.0),
            font,
        );
        layer.use_text(
            "TOTAL:                   $323.67",
            12.0,
            Mm(20.0),
            Mm(160.0),
            font,
        );

        Ok(())
    }

    fn add_business_card_content(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
    ) -> Result<(), String> {
        layer.use_text("JOHN SMITH", 16.0, Mm(50.0), Mm(200.0), font);
        layer.use_text("Senior Developer", 12.0, Mm(50.0), Mm(190.0), font);
        layer.use_text("Scanner Tool Corp.", 10.0, Mm(50.0), Mm(175.0), font);
        layer.use_text("john.smith@scantech.com", 10.0, Mm(50.0), Mm(165.0), font);
        layer.use_text("+1 (555) 123-4567", 10.0, Mm(50.0), Mm(155.0), font);

        Ok(())
    }

    fn add_generic_content(
        layer: &PdfLayerReference,
        font: &IndirectFontRef,
        document_type: &DocumentType,
    ) -> Result<(), String> {
        let title = match document_type {
            DocumentType::Mixed => "MIXED CONTENT DOCUMENT",
            DocumentType::Image => "IMAGE DOCUMENT",
            _ => "GENERIC DOCUMENT",
        };

        layer.use_text(title, 18.0, Mm(20.0), Mm(270.0), font);
        layer.use_text(
            "This is a simulated scan of a document generated by Scanner Tool.",
            12.0,
            Mm(20.0),
            Mm(240.0),
            font,
        );
        layer.use_text(
            "Generated for testing and development purposes.",
            10.0,
            Mm(20.0),
            Mm(220.0),
            font,
        );

        Ok(())
    }
}
