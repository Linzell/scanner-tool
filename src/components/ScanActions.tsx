import React from 'react';
import { Scan, Play, Square, RotateCcw, AlertCircle, CheckCircle2, Loader2, FileText, FolderOpen } from 'lucide-react';
import type { Scanner, ScanJob, DocumentType, ScanSettings } from '../types/scanner';
import { clsx } from 'clsx';
import { isJobActive, isJobCompleted, isJobFailed, getJobStatusText } from '../services/scannerApi';
import { ScannerApi } from '../services/scannerApi';

interface ScanActionsProps {
  scanner: Scanner | null;
  documentType: DocumentType | null;
  settings: ScanSettings;
  currentJob: ScanJob | null;
  onStartScan: () => void;
  onCancelScan: () => void;
  onResetForm: () => void;
  isProcessing?: boolean;
  className?: string;
}

// Helper function to format file sizes
const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const ScanActions: React.FC<ScanActionsProps> = ({
  scanner,
  documentType,
  settings,
  currentJob,
  onStartScan,
  onCancelScan,
  onResetForm,
  isProcessing = false,
  className,
}) => {
  const canStartScan = scanner && documentType && !isProcessing && (!currentJob || !isJobActive(currentJob));
  const canCancel = currentJob && isJobActive(currentJob);

  const getJobStatusIcon = () => {
    if (!currentJob) return null;

    if (isJobActive(currentJob)) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }

    if (isJobCompleted(currentJob)) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }

    if (isJobFailed(currentJob)) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }

    return null;
  };

  const getProgressBarColor = () => {
    if (!currentJob) return 'bg-blue-500';

    if (isJobCompleted(currentJob)) return 'bg-green-500';
    if (isJobFailed(currentJob)) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onStartScan}
          disabled={!canStartScan}
          className={clsx(
            'flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            canStartScan
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
          data-testid="start-scan-button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Starting Scan...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Scan
            </>
          )}
        </button>

        {canCancel && (
          <button
            onClick={onCancelScan}
            className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            data-testid="cancel-scan-button"
          >
            <Square className="w-5 h-5 mr-2" />
            Cancel Scan
          </button>
        )}

        <button
          onClick={onResetForm}
          className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gray-600 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          data-testid="reset-form-button"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </button>

        <button
          onClick={async () => {
            try {
              await ScannerApi.openOutputDirectory();
              console.log('Output directory opened successfully');
            } catch (error) {
              console.error('Failed to open output directory:', error);
            }
          }}
          className="flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          data-testid="open-directory-button"
          title="Open the folder where scanned files are saved"
        >
          <FolderOpen className="w-5 h-5 mr-2 flex-shrink-0 text-white" strokeWidth={2} />
          Open Scans Folder
        </button>
      </div>

      {/* Prerequisites Check */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Scan className="w-4 h-4 mr-2" />
          Scan Readiness Check
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Scanner Selected:</span>
            <span className={clsx(
              'font-medium',
              scanner ? 'text-green-600' : 'text-red-600'
            )}>
              {scanner ? `✓ ${scanner.name}` : '✗ None selected'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Document Type:</span>
            <span className={clsx(
              'font-medium',
              documentType ? 'text-green-600' : 'text-red-600'
            )}>
              {documentType ? `✓ ${documentType}` : '✗ None selected'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Settings Configured:</span>
            <span className="text-green-600 font-medium">
              ✓ {settings.resolution} DPI, {settings.output_format}
            </span>
          </div>
        </div>
      </div>

      {/* Current Job Status */}
      {currentJob && (
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              {getJobStatusIcon()}
              <span className="ml-2">Current Scan Job</span>
            </h3>
            <span className="text-xs text-gray-500">
              ID: {currentJob.id.slice(0, 8)}...
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={clsx(
                'font-medium',
                isJobCompleted(currentJob) && 'text-green-600',
                isJobFailed(currentJob) && 'text-red-600',
                isJobActive(currentJob) && 'text-blue-600'
              )}>
                {getJobStatusText(currentJob)}
              </span>
            </div>

            {/* Progress Bar */}
            {isJobActive(currentJob) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="text-gray-900 font-medium">
                    {Math.round(currentJob.progress * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={clsx(
                      'h-2 rounded-full transition-all duration-300',
                      getProgressBarColor()
                    )}
                    style={{ width: `${currentJob.progress * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Document:</span> {currentJob.document_type}
              </div>
              <div>
                <span className="font-medium">Format:</span> {currentJob.scan_settings.output_format}
              </div>
              <div>
                <span className="font-medium">Quality:</span> {currentJob.scan_settings.quality}%
              </div>
              <div>
                <span className="font-medium">Started:</span> {new Date(currentJob.created_at).toLocaleTimeString()}
              </div>
            </div>

            {currentJob.completed_at && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">
                  {isJobCompleted(currentJob) ? 'Completed' : 'Ended'}:
                </span> {new Date(currentJob.completed_at).toLocaleTimeString()}
              </div>
            )}

            {/* File Results */}
            {isJobCompleted(currentJob) && currentJob.scan_result && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Scan Complete - File Generated
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700 mb-3">
                  <div><span className="font-medium">File Size:</span> {formatFileSize(currentJob.scan_result.file_size)}</div>
                  <div><span className="font-medium">Resolution:</span> {currentJob.scan_result.resolution} DPI</div>
                  <div><span className="font-medium">Format:</span> {currentJob.scan_result.format}</div>
                  <div><span className="font-medium">Pages:</span> {currentJob.scan_result.pages}</div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={async () => {
                      try {
                        await ScannerApi.previewScanFile(currentJob.scan_result!.file_path);
                      } catch (error) {
                        console.error('Failed to open file:', error);
                      }
                    }}
                    className="flex items-center px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                    title="Open the scanned file"
                  >
                    <FileText className="w-4 h-4 mr-2 flex-shrink-0" strokeWidth={2} />
                    Open File
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await ScannerApi.openOutputDirectory();
                      } catch (error) {
                        console.error('Failed to open directory:', error);
                      }
                    }}
                    className="flex items-center px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                    title="Show file location in folder"
                  >
                    <FolderOpen className="w-4 h-4 mr-2 flex-shrink-0" strokeWidth={2} />
                    Show in Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!canStartScan && !currentJob && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Ready to Scan?</h3>
              <p className="text-sm text-blue-700 mt-1">
                Select a scanner and document type to begin scanning. Make sure your scanner is connected and powered on.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
