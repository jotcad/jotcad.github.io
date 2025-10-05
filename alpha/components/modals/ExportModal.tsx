/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal for specifying a filename before exporting data. It provides a default,
 * date-stamped filename that the user can edit.
 */

import React, { useState } from 'react';

interface ExportModalProps {
    onClose: () => void;
    onConfirm: (filename: string) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onConfirm }) => {
    const defaultFileName = `author-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const [fileName, setFileName] = useState(defaultFileName);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (fileName.trim()) {
            // Basic validation to ensure it ends with .json
            const finalFileName = fileName.trim().endsWith('.json')
                ? fileName.trim()
                : `${fileName.trim()}.json`;
            onConfirm(finalFileName);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3 className="modal-title">Export Data</h3>
                    <div className="modal-body">
                        <label htmlFor="fileName">Filename</label>
                        <input
                            id="fileName"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="modal-input"
                            autoFocus
                        />
                        <p className="modal-info-text">You will be asked to select a folder in Google Drive next.</p>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button-create" disabled={!fileName.trim()}>Continue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExportModal;
