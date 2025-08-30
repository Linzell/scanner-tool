import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import type { ScanSettings as ScanSettingsType, ColorMode, PaperSize, OutputFormat } from '../types/scanner';
import { clsx } from 'clsx';
import { formatColorMode, formatOutputFormat, formatPaperSize } from '../services/scannerApi';

interface ScanSettingsProps {
  settings: ScanSettingsType;
  onSettingsChange: (settings: ScanSettingsType) => void;
  availableColorModes?: ColorMode[];
  availablePaperSizes?: PaperSize[];
  availableOutputFormats?: OutputFormat[];
  maxResolution?: number;
  hasDuplex?: boolean;
  className?: string;
}

export const ScanSettings: React.FC<ScanSettingsProps> = ({
  settings,
  onSettingsChange,
  availableColorModes = ['BlackAndWhite', 'Grayscale', 'Color'],
  availablePaperSizes = ['A4', 'A3', 'Letter', 'Legal'],
  availableOutputFormats = ['Pdf', 'Jpeg', 'Png', 'Tiff'],
  maxResolution = 600,
  hasDuplex = true,
  className,
}) => {
  const updateSetting = <K extends keyof ScanSettingsType>(
    key: K,
    value: ScanSettingsType[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const resolutionOptions = [150, 300, 600, 1200, 2400].filter(
    (res) => res <= maxResolution
  );

  const qualityPercentage = settings.quality;

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Scan Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resolution */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Resolution (DPI)
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => updateSetting('resolution', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="resolution-select"
          >
            {resolutionOptions.map((resolution) => (
              <option key={resolution} value={resolution}>
                {resolution} DPI
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Higher resolution = better quality, larger file size
          </p>
        </div>

        {/* Color Mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Color Mode
          </label>
          <select
            value={settings.color_mode}
            onChange={(e) => updateSetting('color_mode', e.target.value as ColorMode)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="color-mode-select"
          >
            {availableColorModes.map((mode) => (
              <option key={mode} value={mode}>
                {formatColorMode(mode)}
              </option>
            ))}
          </select>
        </div>

        {/* Paper Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Paper Size
          </label>
          <select
            value={typeof settings.paper_size === 'string' ? settings.paper_size : 'Custom'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'Custom') {
                updateSetting('paper_size', { Custom: { width: 210, height: 297 } });
              } else {
                updateSetting('paper_size', value as PaperSize);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="paper-size-select"
          >
            {availablePaperSizes.map((size) => (
              <option key={typeof size === 'string' ? size : 'Custom'} value={typeof size === 'string' ? size : 'Custom'}>
                {formatPaperSize(size)}
              </option>
            ))}
          </select>
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Output Format
          </label>
          <select
            value={settings.output_format}
            onChange={(e) => updateSetting('output_format', e.target.value as OutputFormat)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="output-format-select"
          >
            {availableOutputFormats.map((format) => (
              <option key={format} value={format}>
                {formatOutputFormat(format)}
              </option>
            ))}
          </select>
        </div>

        {/* Quality */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Quality ({qualityPercentage}%)
            </label>
            <Sliders className="w-4 h-4 text-gray-400" />
          </div>
          <div className="px-3">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.quality}
              onChange={(e) => updateSetting('quality', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              data-testid="quality-slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (10%)</span>
              <span>Medium (50%)</span>
              <span>High (100%)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Higher quality = better image, larger file size
          </p>
        </div>

        {/* Duplex */}
        {hasDuplex && (
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="duplex"
                checked={settings.duplex}
                onChange={(e) => updateSetting('duplex', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                data-testid="duplex-checkbox"
              />
              <label htmlFor="duplex" className="text-sm font-medium text-gray-700">
                Duplex Scanning (Both Sides)
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Automatically scan both sides of the document
            </p>
          </div>
        )}
      </div>

      {/* Settings Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Settings Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Resolution:</span> {settings.resolution} DPI
          </div>
          <div>
            <span className="font-medium">Color:</span> {formatColorMode(settings.color_mode)}
          </div>
          <div>
            <span className="font-medium">Format:</span> {formatOutputFormat(settings.output_format)}
          </div>
          <div>
            <span className="font-medium">Quality:</span> {settings.quality}%
          </div>
          <div>
            <span className="font-medium">Paper:</span> {formatPaperSize(settings.paper_size)}
          </div>
          <div>
            <span className="font-medium">Duplex:</span> {settings.duplex ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>
  );
};
