import React, { useState } from 'react';
import { Monitor, HardDrive, Activity, RefreshCw, Loader2, Info } from 'lucide-react';
import type { SystemInfo } from '../types/scanner';
import { clsx } from 'clsx';
import { ScannerApi } from '../services/scannerApi';

interface SystemInfoPanelProps {
  systemInfo: SystemInfo | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({
  systemInfo,
  isLoading = false,
  onRefresh,
  className,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateEvents = async () => {
    setIsSimulating(true);
    try {
      await ScannerApi.simulateScannerEvents();
      // Trigger refresh after simulation
      setTimeout(() => {
        onRefresh?.();
      }, 500);
    } catch (error) {
      console.error('Failed to simulate scanner events:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Windows':
        return <Monitor className="w-5 h-5 text-blue-500" />;
      case 'MacOS':
        return <Monitor className="w-5 h-5 text-gray-600" />;
      case 'Linux':
        return <Monitor className="w-5 h-5 text-orange-500" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (activeJobs: number) => {
    if (activeJobs === 0) return 'text-green-600';
    if (activeJobs <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={clsx('bg-white rounded-lg shadow-sm border p-6', className)}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Loading system information...</span>
        </div>
      </div>
    );
  }

  if (!systemInfo) {
    return (
      <div className={clsx('bg-white rounded-lg shadow-sm border p-6', className)}>
        <div className="flex items-center justify-center text-gray-500">
          <Info className="w-6 h-6 mr-3" />
          <span>System information unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border mt-4', className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">System Information</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleSimulateEvents}
              disabled={isSimulating}
              className={clsx(
                'flex items-center space-x-2 px-3 py-1 text-sm rounded border transition-colors',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                isSimulating
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-600 border-gray-300'
              )}
              title="Simulate scanner events (disconnect/error/reconnect)"
            >
              {isSimulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>{isSimulating ? 'Simulating...' : 'Simulate Events'}</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={clsx(
                  'flex items-center space-x-2 px-3 py-1 text-sm rounded border transition-colors',
                  'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isLoading
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-600 border-gray-300'
                )}
                title="Refresh system information"
              >
                <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Platform Info */}
          <div className="flex items-center space-x-3">
            {getPlatformIcon(systemInfo.platform)}
            <div>
              <div className="text-sm font-medium text-gray-900">Platform</div>
              <div className="text-sm text-gray-600">{systemInfo.platform}</div>
            </div>
          </div>

          {/* Scanner API */}
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Scanner API</div>
              <div className="text-sm text-gray-600 truncate" title={systemInfo.scanner_api}>
                {systemInfo.scanner_api}
              </div>
            </div>
          </div>

          {/* Available Scanners */}
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Available Scanners</div>
              <div className="text-sm text-gray-600">
                {systemInfo.available_scanners} of {systemInfo.total_scanners}
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="flex items-center space-x-3">
            <Activity className={clsx('w-5 h-5', getStatusColor(systemInfo.active_jobs))} />
            <div>
              <div className="text-sm font-medium text-gray-900">Active Jobs</div>
              <div className={clsx('text-sm font-medium', getStatusColor(systemInfo.active_jobs))}>
                {systemInfo.active_jobs}
                {systemInfo.active_jobs === 0 && (
                  <span className="text-gray-500 font-normal"> (Idle)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>System Status:</span>
              <span className={clsx(
                'font-medium',
                systemInfo.active_jobs === 0 ? 'text-green-600' : 'text-yellow-600'
              )}>
                {systemInfo.active_jobs === 0 ? 'Ready' : `${systemInfo.active_jobs} job(s) running`}
              </span>
            </div>

            {systemInfo.available_scanners < systemInfo.total_scanners && (
              <div className="flex items-center justify-between mt-2">
                <span>Unavailable Scanners:</span>
                <span className="text-yellow-600 font-medium">
                  {systemInfo.total_scanners - systemInfo.available_scanners}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span>Scanner Discovery:</span>
              <span className="text-gray-700">
                {systemInfo.platform === 'Windows' && 'WIA Compatible'}
                {systemInfo.platform === 'MacOS' && 'Image Capture'}
                {systemInfo.platform === 'Linux' && 'SANE Compatible'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
