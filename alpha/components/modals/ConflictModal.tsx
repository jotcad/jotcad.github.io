/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal-like view component for resolving data synchronization conflicts.
 * It presents the user with a choice between their local version and the version
 * from the cloud.
 */

import React from 'react';
import { Books, Conflict } from '../../types/types.ts';

interface ConflictModalProps {
    conflict: Conflict<Books>;
    onResolve: (chosenBooks: Books) => void;
}

const ConflictModal: React.FC<ConflictModalProps> = ({ conflict, onResolve }) => {
    return (
        <div className="conflict-container">
            <h2>Sync Conflict</h2>
            <p>The content was changed on another device. Please choose which version to keep.</p>
            <div className="conflict-actions">
                <button className="button secondary" onClick={() => onResolve(conflict.local)}>Keep My Version</button>
                <button className="button primary" onClick={() => onResolve(conflict.remote)}>Use Cloud Version</button>
            </div>
        </div>
    );
};

export default ConflictModal;
