/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal component for saving a new named version of an entry. It provides an
 * input field for the version name and handles the save confirmation.
 */

import React, { useState } from 'react';

interface SaveVersionModalProps {
    onClose: () => void;
    onSave: (versionName: string) => void;
}

const SaveVersionModal: React.FC<SaveVersionModalProps> = ({ onClose, onSave }) => {
    const [versionName, setVersionName] = useState(`Version - ${new Date().toLocaleString()}`);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (versionName.trim()) {
            onSave(versionName.trim());
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3 className="modal-title">Save New Version</h3>
                    <div className="modal-body">
                        <label htmlFor="versionName">Version Name</label>
                        <input
                            id="versionName"
                            type="text"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            className="modal-input"
                            autoFocus
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button-create" disabled={!versionName.trim()}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveVersionModal;
