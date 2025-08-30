import React from 'react';
import { Monitor, Apple, HardDrive } from 'lucide-react';
import type { SystemType } from '../types/scanner';
import { clsx } from 'clsx';

interface SystemSelectorProps {
  selectedSystem: SystemType | null;
  onSystemSelect: (system: SystemType) => void;
  className?: string;
}

const SYSTEMS: { type: SystemType; label: string; icon: React.ComponentType<any> }[] = [
  { type: 'Windows', label: 'Windows', icon: Monitor },
  { type: 'MacOS', label: 'macOS', icon: Apple },
  { type: 'Linux', label: 'Linux', icon: HardDrive },
];

export const SystemSelector: React.FC<SystemSelectorProps> = ({
  selectedSystem,
  onSystemSelect,
  className,
}) => {
  return (
    <div className={clsx('space-y-4', className)}>
      <h2 className="text-xl font-semibold text-gray-800">Select System Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SYSTEMS.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onSystemSelect(type)}
            className={clsx(
              'flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500',
              selectedSystem === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            )}
            data-testid={`system-selector-${type.toLowerCase()}`}
          >
            <Icon className="w-8 h-8 mb-2" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
