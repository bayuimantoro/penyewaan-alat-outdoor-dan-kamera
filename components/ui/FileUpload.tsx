'use client';

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number; // in MB
    preview?: boolean;
    className?: string;
}

export function FileUpload({
    onFileSelect,
    accept = 'image/*',
    maxSize = 5,
    preview = true,
    className,
}: FileUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(
        (file: File) => {
            setError(null);

            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
                setError(`Ukuran file maksimal ${maxSize}MB`);
                return;
            }

            // Create preview for images
            if (preview && file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
            }

            onFileSelect(file);
        },
        [maxSize, preview, onFileSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    return (
        <div>
            <label
                className={cn('file-upload', dragOver && 'dragover', className)}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />

                {previewUrl ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                maxWidth: '200px',
                                maxHeight: '150px',
                                borderRadius: '0.5rem',
                                objectFit: 'cover',
                            }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Klik untuk mengganti
                        </span>
                    </div>
                ) : (
                    <>
                        <svg
                            className="file-upload-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p className="file-upload-text">
                            <strong>Klik untuk upload</strong> atau drag & drop
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Maksimal {maxSize}MB
                        </p>
                    </>
                )}
            </label>

            {error && (
                <p className="error-text" style={{ marginTop: '0.5rem' }}>
                    {error}
                </p>
            )}
        </div>
    );
}
