import React from 'react';
import { FileText, Image, File, Camera, CreditCard, Receipt, FileCheck, FileSpreadsheet } from 'lucide-react';
import type { DocumentType } from '../types/scanner';
import { clsx } from 'clsx';
import { formatDocumentType } from '../services/scannerApi';

interface DocumentTypeSelectorProps {
  selectedDocumentType: DocumentType | null;
  onDocumentTypeSelect: (type: DocumentType) => void;
  className?: string;
}

const DOCUMENT_TYPES: {
  type: DocumentType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}[] = [
    {
      type: 'Text',
      label: 'Text Document',
      icon: FileText,
      description: 'Regular text documents, letters, reports'
    },
    {
      type: 'Image',
      label: 'Image',
      icon: Image,
      description: 'Photos, artwork, diagrams'
    },
    {
      type: 'Mixed',
      label: 'Mixed Content',
      icon: File,
      description: 'Documents with text and images'
    },
    {
      type: 'Photo',
      label: 'Photo',
      icon: Camera,
      description: 'High-quality photo scanning'
    },
    {
      type: 'BusinessCard',
      label: 'Business Card',
      icon: CreditCard,
      description: 'Business cards, small cards'
    },
    {
      type: 'Receipt',
      label: 'Receipt',
      icon: Receipt,
      description: 'Receipts, tickets, small documents'
    },
    {
      type: 'Contract',
      label: 'Contract',
      icon: FileCheck,
      description: 'Legal documents, contracts'
    },
    {
      type: 'Invoice',
      label: 'Invoice',
      icon: FileSpreadsheet,
      description: 'Bills, invoices, financial documents'
    },
  ];

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selectedDocumentType,
  onDocumentTypeSelect,
  className,
}) => {
  return (
    <div className={clsx('space-y-4', className)}>
      <h2 className="text-xl font-semibold text-gray-800">Select Document Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOCUMENT_TYPES.map(({ type, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => onDocumentTypeSelect(type)}
            className={clsx(
              'flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left',
              selectedDocumentType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            )}
            data-testid={`document-type-${type.toLowerCase().replace(/([A-Z])/g, '-$1')}`}
          >
            <Icon className="w-6 h-6 mb-3" />
            <div>
              <h3 className="font-medium text-sm mb-1">{formatDocumentType(type)}</h3>
              <p className="text-xs opacity-75">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
