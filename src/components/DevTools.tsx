import React, { useState } from 'react';
import { Bug, Database, Zap, RefreshCw, Loader2, Plus } from 'lucide-react';
import { ScannerApi } from '../services/scannerApi';
import type { Scanner, ScannerType } from '../types/scanner';
import { clsx } from 'clsx';

interface DevToolsProps {
  onRefresh?: () => void;
  className?: string;
}

export const DevTools: React.FC<DevToolsProps> = ({
  onRefresh,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isAddingScanner, setIsAddingScanner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newScannerName, setNewScannerName] = useState('');
  const [newScannerType, setNewScannerType] = useState<ScannerType>('Flatbed');

  // Mock scanner templates for quick adding
  const mockScannerTemplates = [
    {
      name: 'HP Test Scanner',
      scanner_type: 'DocumentFeeder' as ScannerType,
      capabilities: {
        max_resolution: 1200,
        has_duplex: true,
        has_adf: true,
      }
    },
    {
      name: 'Canon Mock Scanner',
      scanner_type: 'Flatbed' as ScannerType,
      capabilities: {
        max_resolution: 4800,
        has_duplex: false,
        has_adf: false,
      }
    },
    {
      name: 'Epson Dev Scanner',
      scanner_type: 'PhotoScanner' as ScannerType,
      capabilities: {
        max_resolution: 6400,
        has_duplex: false,
        has_adf: false,
      }
    }
  ];

  const handleSimulateEvents = async () => {
    setIsSimulating(true);
    try {
      await ScannerApi.simulateScannerEvents();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to simulate events:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDiscoverScanners = async () => {
    setIsDiscovering(true);
    try {
      await ScannerApi.discoverScanners();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to discover scanners:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddMockScanner = async (template: any) => {
    setIsAddingScanner(true);
    try {
      // Get system info to determine current platform
      const systemInfo = await ScannerApi.getSystemInfo();

      const mockScanner: Scanner = {
        id: '',
        name: template.name + ` (${Date.now()})`,
        scanner_type: template.scanner_type,
        status: 'Available',
        system_type: systemInfo.platform,
        capabilities: {
          max_resolution: template.capabilities.max_resolution,
          color_modes: ['BlackAndWhite', 'Grayscale', 'Color'],
          paper_sizes: ['A4', 'Letter', 'Legal'],
          has_duplex: template.capabilities.has_duplex,
          has_adf: template.capabilities.has_adf,
        }
      };

      await ScannerApi.addScanner(mockScanner);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to add mock scanner:', error);
    } finally {
      setIsAddingScanner(false);
    }
  };

  const handleAddCustomScanner = async () => {
    if (!newScannerName.trim()) return;

    setIsAddingScanner(true);
    try {
      const systemInfo = await ScannerApi.getSystemInfo();

      const customScanner: Scanner = {
        id: '',
        name: newScannerName,
        scanner_type: newScannerType,
        status: 'Available',
        system_type: systemInfo.platform,
        capabilities: {
          max_resolution: 600,
          color_modes: ['BlackAndWhite', 'Grayscale', 'Color'],
          paper_sizes: ['A4', 'Letter'],
          has_duplex: newScannerType === 'DocumentFeeder',
          has_adf: newScannerType === 'DocumentFeeder' || newScannerType === 'SheetFed',
        }
      };

      await ScannerApi.addScanner(customScanner);
      setNewScannerName('');
      setShowAddForm(false);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to add custom scanner:', error);
    } finally {
      setIsAddingScanner(false);
    }
  };

  const formatScannerType = (type: ScannerType): string => {
    switch (type) {
      case 'DocumentFeeder': return 'Document Feeder';
      case 'SheetFed': return 'Sheet Fed';
      case 'FilmScanner': return 'Film Scanner';
      case 'PhotoScanner': return 'Photo Scanner';
      default: return type;
    }
  };

  if (!isExpanded) {
    return (
      <div className={clsx('fixed bottom-4 right-4 z-50', className)}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
          title="Open DevTools"
        >
          <Bug className="w-4 h-4" />
          <span className="hidden sm:inline">DevTools</span>
        </button>
      </div>
    );
  }

  return (
    <div className={clsx('fixed bottom-4 right-4 z-50 w-96', className)}>
      <div className="bg-gray-800 text-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-blue-400" />
            <span className="font-medium">DevTools</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Scanner Management */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Scanner Management</h3>
            <div className="space-y-2">
              <button
                onClick={handleDiscoverScanners}
                disabled={isDiscovering}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded text-sm transition-colors"
              >
                {isDiscovering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                <span>{isDiscovering ? 'Discovering...' : 'Discover Scanners'}</span>
              </button>

              <button
                onClick={handleSimulateEvents}
                disabled={isSimulating}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 rounded text-sm transition-colors"
              >
                {isSimulating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isSimulating ? 'Simulating...' : 'Simulate Events'}</span>
              </button>

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh All</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Mock Scanners */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Add Mock Scanners</h3>
            <div className="space-y-2">
              {mockScannerTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleAddMockScanner(template)}
                  disabled={isAddingScanner}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition-colors"
                >
                  <span className="truncate">{template.name}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatScannerType(template.scanner_type)}
                  </span>
                </button>
              ))}

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Scanner</span>
              </button>
            </div>
          </div>

          {/* Custom Scanner Form */}
          {showAddForm && (
            <div className="space-y-3 p-3 bg-gray-700 rounded">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Scanner Name</label>
                <input
                  type="text"
                  value={newScannerName}
                  onChange={(e) => setNewScannerName(e.target.value)}
                  placeholder="Enter scanner name"
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Scanner Type</label>
                <select
                  value={newScannerType}
                  onChange={(e) => setNewScannerType(e.target.value as ScannerType)}
                  className="w-full px-2 py-1 bg-gray-600 text-white rounded text-sm"
                >
                  <option value="Flatbed">Flatbed</option>
                  <option value="DocumentFeeder">Document Feeder</option>
                  <option value="SheetFed">Sheet Fed</option>
                  <option value="Handheld">Handheld</option>
                  <option value="FilmScanner">Film Scanner</option>
                  <option value="PhotoScanner">Photo Scanner</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleAddCustomScanner}
                  disabled={isAddingScanner || !newScannerName.trim()}
                  className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded text-sm transition-colors"
                >
                  {isAddingScanner ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  <span>Add</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewScannerName('');
                  }}
                  className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="text-xs text-gray-400 border-t border-gray-700 pt-3">
            <div>Environment: Development</div>
            <div>Build: {import.meta.env.MODE || 'development'}</div>
            <div>Last update: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
