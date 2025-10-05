/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A reusable modal component for confirming a delete action. It displays a warning
 * and requires user confirmation before proceeding with the deletion.
 */

import React from 'react';

interface ConfirmDeleteModalProps {
    item: { type: 'book' | 'pov' | 'entry', id: string, name: string };
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ item, onClose, onConfirm }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Confirm Deletion</h3>
                <div className="modal-body">
                    <p>Are you sure you want to permanently delete "{item.name}"?</p>
                    <p className="modal-warning">This action cannot be undone.</p>
                </div>
                <div className="modal-actions">
                    <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                    <button type="button" className="button-delete" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
