/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal component that displays application settings, specifically the options
 * for importing and exporting data to/from Google Drive.
 */

import React from 'react';

interface SettingsModalProps {
    onClose: () => void;
    onExport: () => void;
    onImport: () => void;
    isPickerApiLoaded: boolean;
    isLoading: boolean;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onExport, onImport, isPickerApiLoaded, isLoading }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Settings</h3>
                <div className="settings-modal-body">
                    <div className="settings-action">
                        <h4>Export to Google Drive</h4>
                        <p>Save a backup of all your data to a JSON file in your Google Drive.</p>
                        <button className="button secondary" onClick={onExport} disabled={!isPickerApiLoaded || isLoading}>
                            {isPickerApiLoaded ? 'Export Data' : 'Loading...'}
                        </button>
                    </div>
                    <div className="settings-action">
                        <h4>Import from Google Drive</h4>
                        <p>Restore data from a backup file. This will overwrite all current data.</p>
                        <button className="button secondary" onClick={onImport} disabled={!isPickerApiLoaded || isLoading}>
                            {isPickerApiLoaded ? 'Import Data' : 'Loading...'}
                        </button>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="button-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
