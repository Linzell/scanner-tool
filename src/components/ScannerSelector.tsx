import React from 'react';
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import type { Scanner, SystemType } from '../types/scanner';
import { clsx } from 'clsx';
import { formatScannerType, getScannerStatusText, isScannerAvailable } from '../services/scannerApi';

interface ScannerSelectorProps {
  scanners: Scanner[];
  selectedScanner: Scanner | null;
  onScannerSelect: (scanner: Scanner) => void;
  systemType: SystemType;
  isLoading?: boolean;
  onTestConnection?: (scannerId: string) => void;
  testingConnection?: string | null;
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
  className,
}) => {
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
        <h2 className="text-xl font-semibold text-gray-800">Available Scanners</h2>
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No scanners found</h3>
          <p className="text-gray-500 text-center">
            No scanners are available for {systemType}. Please check your scanner connections and drivers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      <h2 className="text-xl font-semibold text-gray-800">
        Available Scanners ({scanners.length})
      </h2>
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
              {onTestConnection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestConnection(scanner.id);
                  }}
                  disabled={testingConnection === scanner.id}
                  className={clsx(
                    'px-3 py-1 text-sm rounded border transition-colors',
                    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                    testingConnection === scanner.id
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-white text-gray-600 border-gray-300'
                  )}
                  data-testid={`test-connection-${scanner.id}`}
                >
                  {testingConnection === scanner.id ? 'Testing...' : 'Test'}
                </button>
              )}

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
