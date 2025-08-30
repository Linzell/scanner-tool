import React, { useState } from 'react';
import { Loader2, Wifi, WifiOff, AlertCircle, RefreshCw, Settings, Trash2 } from 'lucide-react';
import type { Scanner, SystemType } from '../types/scanner';
import { clsx } from 'clsx';
import { formatScannerType, getScannerStatusText, isScannerAvailable, ScannerApi } from '../services/scannerApi';

interface ScannerSelectorProps {
  scanners: Scanner[];
  selectedScanner: Scanner | null;
  onScannerSelect: (scanner: Scanner) => void;
  systemType: SystemType;
  isLoading?: boolean;
  onTestConnection?: (scannerId: string) => void;
  testingConnection?: string | null;
  onRefreshScanners?: () => void;
  onRemoveScanner?: (scannerId: string) => void;
  onResetScannerStatus?: (scannerId: string) => void;
  className?: string;
}

export const ScannerSelector: React.FC<ScannerSelectorProps> = ({
  scanners,
  selectedScanner,
  onScannerSelect,
  systemType,
  isLoading = false,
  onTestConnection,
  testingConnection,
  onRefreshScanners,
  onRemoveScanner,
  onResetScannerStatus,
  className,
}) => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [managingScanner, setManagingScanner] = useState<string | null>(null);

  const handleDiscoverScanners = async () => {
    setIsDiscovering(true);
    try {
      await ScannerApi.discoverScanners();
      onRefreshScanners?.();
    } catch (error) {
      console.error('Failed to discover scanners:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleResetStatus = async (scannerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setManagingScanner(scannerId);
    try {
      await ScannerApi.resetScannerStatus(scannerId);
      onResetScannerStatus?.(scannerId);
    } catch (error) {
      console.error('Failed to reset scanner status:', error);
    } finally {
      setManagingScanner(null);
    }
  };

  const handleRemoveScanner = async (scannerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this scanner?')) {
      return;
    }

    setManagingScanner(scannerId);
    try {
      await ScannerApi.removeScanner(scannerId);
      onRemoveScanner?.(scannerId);
    } catch (error) {
      console.error('Failed to remove scanner:', error);
      alert('Failed to remove scanner. It may have active scan jobs.');
    } finally {
      setManagingScanner(null);
    }
  };
  const getScannerIcon = (scanner: Scanner) => {
    if (testingConnection === scanner.id) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }

    if (isScannerAvailable(scanner)) {
      return <Wifi className="w-5 h-5 text-green-500" />;
    }

    return <WifiOff className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadgeColor = (scanner: Scanner) => {
    if (isScannerAvailable(scanner)) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (scanner.status === 'Busy') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (scanner.status === 'Offline') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading) {
    return (
      <div className={clsx('space-y-4', className)}>
        <h2 className="text-xl font-semibold text-gray-800">Available Scanners</h2>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Loading scanners...</span>
        </div>
      </div>
    );
  }

  if (scanners.length === 0) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Available Scanners</h2>
          <button
            onClick={handleDiscoverScanners}
            disabled={isDiscovering}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 text-sm rounded-lg border transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDiscovering
                ? 'bg-blue-100 text-blue-600 border-blue-200 cursor-not-allowed'
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            )}
          >
            {isDiscovering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isDiscovering ? 'Discovering...' : 'Discover Scanners'}</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No scanners detected</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            No scanners have been discovered for {systemType} yet. Click "Discover Scanners" to scan for available devices using the {systemType === 'MacOS' ? 'Image Capture framework' : systemType === 'Windows' ? 'WIA API' : 'SANE daemon'}.
          </p>

          <div className="text-sm text-gray-400 text-center">
            <p>Make sure your scanners are:</p>
            <ul className="mt-2 space-y-1">
              <li>• Connected and powered on</li>
              <li>• Drivers properly installed</li>
              <li>• Not being used by other applications</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Available Scanners ({scanners.length})
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleDiscoverScanners}
            disabled={isDiscovering || isLoading}
            className={clsx(
              'flex items-center space-x-2 px-3 py-2 text-sm rounded border transition-colors',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDiscovering || isLoading
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-600 border-gray-300'
            )}
            title="Discover new scanners"
          >
            {isDiscovering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isDiscovering ? 'Discovering...' : 'Discover'}</span>
          </button>

          {onRefreshScanners && (
            <button
              onClick={onRefreshScanners}
              disabled={isLoading}
              className={clsx(
                'flex items-center space-x-2 px-3 py-2 text-sm rounded border transition-colors',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLoading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-600 border-gray-300'
              )}
              title="Refresh scanner list"
            >
              <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {scanners.map((scanner) => (
          <div
            key={scanner.id}
            className={clsx(
              'flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200',
              'hover:shadow-md cursor-pointer',
              selectedScanner?.id === scanner.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
            onClick={() => onScannerSelect(scanner)}
            data-testid={`scanner-${scanner.id}`}
          >
            <div className="flex items-center space-x-4">
              {getScannerIcon(scanner)}
              <div>
                <h3 className="font-medium text-gray-900">{scanner.name}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-600">
                    {formatScannerType(scanner.scanner_type)}
                  </span>
                  <span
                    className={clsx(
                      'text-xs px-2 py-1 rounded-full border',
                      getStatusBadgeColor(scanner)
                    )}
                  >
                    {getScannerStatusText(scanner)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Scanner management buttons */}
              <div className="flex space-x-1">
                {onTestConnection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTestConnection(scanner.id);
                    }}
                    disabled={testingConnection === scanner.id}
                    className={clsx(
                      'px-2 py-1 text-xs rounded border transition-colors',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      testingConnection === scanner.id
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-white text-gray-600 border-gray-300'
                    )}
                    data-testid={`test-connection-${scanner.id}`}
                    title="Test connection"
                  >
                    {testingConnection === scanner.id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                        Testing
                      </>
                    ) : (
                      'Test'
                    )}
                  </button>
                )}

                {onResetScannerStatus && !isScannerAvailable(scanner) && (
                  <button
                    onClick={(e) => handleResetStatus(scanner.id, e)}
                    disabled={managingScanner === scanner.id}
                    className={clsx(
                      'px-2 py-1 text-xs rounded border transition-colors',
                      'hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500',
                      managingScanner === scanner.id
                        ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                        : 'bg-white text-yellow-600 border-yellow-300'
                    )}
                    title="Reset status to available"
                  >
                    {managingScanner === scanner.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Settings className="w-3 h-3" />
                    )}
                  </button>
                )}

                {onRemoveScanner && (
                  <button
                    onClick={(e) => handleRemoveScanner(scanner.id, e)}
                    disabled={managingScanner === scanner.id}
                    className={clsx(
                      'px-2 py-1 text-xs rounded border transition-colors',
                      'hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500',
                      managingScanner === scanner.id
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : 'bg-white text-red-600 border-red-300'
                    )}
                    title="Remove scanner"
                  >
                    {managingScanner === scanner.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Max: {scanner.capabilities.max_resolution} DPI
                </div>
                <div className="text-xs text-gray-500">
                  {scanner.capabilities.has_duplex ? 'Duplex' : 'Simplex'} •{' '}
                  {scanner.capabilities.has_adf ? 'ADF' : 'Manual'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
