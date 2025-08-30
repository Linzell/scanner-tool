import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor } from 'lucide-react';
import { SystemSelector } from './components/SystemSelector';
import { ScannerSelector } from './components/ScannerSelector';
import { DocumentTypeSelector } from './components/DocumentTypeSelector';
import { ScanSettings } from './components/ScanSettings';
import { ScanActions } from './components/ScanActions';
import { ScannerApi } from './services/scannerApi';
import type {
  SystemType,
  Scanner,
  DocumentType,
  ScanSettings as ScanSettingsType,
  ScannerUIState
} from './types/scanner';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const ScannerApp: React.FC = () => {
  const [uiState, setUIState] = useState<ScannerUIState>({
    selectedSystem: null,
    selectedScanner: null,
    selectedDocumentType: null,
    scanSettings: {
      resolution: 300,
      color_mode: 'Color',
      paper_size: 'A4',
      duplex: false,
      output_format: 'Pdf',
      quality: 85,
    },
    currentJob: null,
  });

  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch system info
  const { data: systemInfo } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: ScannerApi.getSystemInfo,
  });

  // Debug system info
  useEffect(() => {
    if (systemInfo) {
      console.log('App: System info received:', systemInfo);
    }
  }, [systemInfo]);

  // Auto-detect and select current system
  useEffect(() => {
    if (systemInfo?.platform && !uiState.selectedSystem) {
      console
        .log('App: Auto-selecting system:', systemInfo.platform);
      setUIState(prev => ({
        ...prev,
        selectedSystem: systemInfo.platform,
      }));
    }
  }, [systemInfo?.platform, uiState.selectedSystem]);

  // Fetch all scanners and filter by selected system
  const { data: allScanners = [], isLoading: isLoadingAllScanners } = useQuery({
    queryKey: ['allScanners'],
    queryFn: ScannerApi.getScanners,
  });

  // Filter scanners by selected system
  const scanners = uiState.selectedSystem
    ? allScanners.filter(scanner => scanner.system_type === uiState.selectedSystem)
    : [];

  const isLoadingScanners = isLoadingAllScanners;

  // Debug scanner filtering
  useEffect(() => {
    console.log('App: All scanners:', allScanners);
    console.log('App: Selected system:', uiState.selectedSystem);
    console.log('App: Filtered scanners:', scanners);
  }, [allScanners, uiState.selectedSystem, scanners]);

  // Fetch default settings
  const { data: defaultSettings } = useQuery({
    queryKey: ['defaultScanSettings'],
    queryFn: ScannerApi.getDefaultScanSettings,
  });

  // Poll current job if active
  const { data: currentJob } = useQuery({
    queryKey: ['scanJob', uiState.currentJob?.id],
    queryFn: () =>
      uiState.currentJob?.id
        ? ScannerApi.getScanJob(uiState.currentJob.id)
        : Promise.resolve(null),
    enabled: !!uiState.currentJob?.id,
    refetchInterval: 1000, // Poll every second
  });

  // Create scan job mutation
  const createScanJobMutation = useMutation({
    mutationFn: ({
      scannerId,
      documentType,
      settings,
    }: {
      scannerId: string;
      documentType: DocumentType;
      settings: ScanSettingsType;
    }) => ScannerApi.createScanJob(scannerId, documentType, settings),
  });

  // Start scan job mutation
  const startScanJobMutation = useMutation({
    mutationFn: (jobId: string) => ScannerApi.startScanJob(jobId),
  });

  // Cancel scan job mutation
  const cancelScanJobMutation = useMutation({
    mutationFn: (jobId: string) => ScannerApi.cancelScanJob(jobId),
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (scannerId: string) => ScannerApi.testScannerConnection(scannerId),
  });

  // Update current job when polling data changes
  useEffect(() => {
    if (currentJob) {
      setUIState(prev => ({
        ...prev,
        currentJob,
      }));
    }
  }, [currentJob]);

  // Initialize default settings
  useEffect(() => {
    if (defaultSettings && !uiState.scanSettings) {
      setUIState(prev => ({
        ...prev,
        scanSettings: defaultSettings,
      }));
    }
  }, [defaultSettings, uiState.scanSettings]);

  const handleSystemSelect = (system: SystemType) => {
    console.log('App: System selected:', system);
    setUIState(prev => ({
      ...prev,
      selectedSystem: system,
      selectedScanner: null, // Reset scanner when system changes
    }));
  };

  const handleScannerSelect = (scanner: Scanner) => {
    console.log('App: Scanner selected:', scanner);
    setUIState(prev => ({
      ...prev,
      selectedScanner: scanner,
    }));
  };

  const handleDocumentTypeSelect = (documentType: DocumentType) => {
    console.log('App: Document type selected:', documentType);
    setUIState(prev => ({
      ...prev,
      selectedDocumentType: documentType,
    }));
  };

  const handleSettingsChange = (settings: ScanSettingsType) => {
    setUIState(prev => ({
      ...prev,
      scanSettings: settings,
    }));
  };

  const handleTestConnection = async (scannerId: string) => {
    setTestingConnection(scannerId);
    try {
      const isConnected = await testConnectionMutation.mutateAsync(scannerId);
      // You could show a toast notification here
      console.log(`Scanner ${scannerId} connection test:`, isConnected ? 'Success' : 'Failed');
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleStartScan = async () => {
    console.log('App: handleStartScan called');
    console.log('App: Selected scanner:', uiState.selectedScanner);
    console.log('App: Selected document type:', uiState.selectedDocumentType);

    if (!uiState.selectedScanner || !uiState.selectedDocumentType) {
      console.log('App: Cannot start scan - missing scanner or document type');
      return;
    }

    try {
      console.log('App: Creating scan job...');
      // Create scan job
      const jobId = await createScanJobMutation.mutateAsync({
        scannerId: uiState.selectedScanner.id,
        documentType: uiState.selectedDocumentType,
        settings: uiState.scanSettings,
      });

      console.log('App: Scan job created with ID:', jobId);

      // Get the created job
      const job = await ScannerApi.getScanJob(jobId);
      console.log('App: Retrieved job:', job);
      setUIState(prev => ({
        ...prev,
        currentJob: job,
      }));

      console.log('App: Starting scan job...');
      // Start the scan job
      await startScanJobMutation.mutateAsync(jobId);

      console.log('App: Scan job started successfully');
      // Refresh scanners to update status
      queryClient.invalidateQueries({ queryKey: ['scanners'] });
    } catch (error) {
      console.error('App: Failed to start scan:', error);
    }
  };

  const handleCancelScan = async () => {
    if (!uiState.currentJob) return;

    try {
      await cancelScanJobMutation.mutateAsync(uiState.currentJob.id);
      queryClient.invalidateQueries({ queryKey: ['scanners'] });
    } catch (error) {
      console.error('Failed to cancel scan:', error);
    }
  };

  const handleResetForm = () => {
    setUIState({
      selectedSystem: null,
      selectedScanner: null,
      selectedDocumentType: null,
      scanSettings: defaultSettings || {
        resolution: 300,
        color_mode: 'Color',
        paper_size: 'A4',
        duplex: false,
        output_format: 'Pdf',
        quality: 85,
      },
      currentJob: null,
    });
  };

  const isProcessing = createScanJobMutation.isPending || startScanJobMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Monitor className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Scanner Tool</h1>
                {systemInfo && (
                  <p className="text-sm text-gray-500">
                    {systemInfo.platform} • {systemInfo.available_scanners} scanners • {systemInfo.active_jobs} active jobs
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* System Selection */}
          <SystemSelector
            selectedSystem={uiState.selectedSystem}
            onSystemSelect={handleSystemSelect}
          />

          {/* Scanner Selection */}
          {uiState.selectedSystem && (
            <ScannerSelector
              scanners={scanners}
              selectedScanner={uiState.selectedScanner}
              onScannerSelect={handleScannerSelect}
              systemType={uiState.selectedSystem}
              isLoading={isLoadingScanners}
              onTestConnection={handleTestConnection}
              testingConnection={testingConnection}
            />
          )}

          {/* Document Type Selection */}
          {uiState.selectedScanner && (
            <DocumentTypeSelector
              selectedDocumentType={uiState.selectedDocumentType}
              onDocumentTypeSelect={handleDocumentTypeSelect}
            />
          )}

          {/* Scan Settings */}
          {uiState.selectedScanner && uiState.selectedDocumentType && (
            <ScanSettings
              settings={uiState.scanSettings}
              onSettingsChange={handleSettingsChange}
              availableColorModes={uiState.selectedScanner.capabilities.color_modes}
              availablePaperSizes={uiState.selectedScanner.capabilities.paper_sizes}
              maxResolution={uiState.selectedScanner.capabilities.max_resolution}
              hasDuplex={uiState.selectedScanner.capabilities.has_duplex}
            />
          )}

          {/* Scan Actions */}
          {uiState.selectedScanner && uiState.selectedDocumentType && (
            <ScanActions
              scanner={uiState.selectedScanner}
              documentType={uiState.selectedDocumentType}
              settings={uiState.scanSettings}
              currentJob={uiState.currentJob}
              onStartScan={handleStartScan}
              onCancelScan={handleCancelScan}
              onResetForm={handleResetForm}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ScannerApp />
    </QueryClientProvider>
  );
};

export default App;
