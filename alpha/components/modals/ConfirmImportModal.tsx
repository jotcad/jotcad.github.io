/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal component for confirming a data import action. It warns the user that
 * importing will overwrite existing data and requires explicit confirmation.
 */

import React from 'react';

interface ConfirmImportModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmImportModal: React.FC<ConfirmImportModalProps> = ({ onClose, onConfirm }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Confirm Import</h3>
                <div className="modal-body">
                    <p>Are you sure you want to import this file? All of your current data will be permanently replaced.</p>
                    <p className="modal-warning">We recommend exporting your current data first as a backup.</p>
                </div>
                <div className="modal-actions">
                    <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                    <button type="button" className="button-delete" onClick={onConfirm}>Import and Overwrite</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmImportModal;
