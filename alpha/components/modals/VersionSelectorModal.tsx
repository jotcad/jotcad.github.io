/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal component for viewing and managing the version history of an entry.
 * It allows users to switch between versions, rename them, or delete them.
 */

import React, { useState } from 'react';
import { Entry, Version } from '../../types/types.ts';

interface VersionSelectorModalProps {
    entry: Entry;
    activeVersionId: string;
    onClose: () => void;
    onSelectVersion: (versionId: string) => void;
    onDeleteVersion: (versionId: string) => void;
    onRenameVersion: (versionId: string, newName: string) => void;
}

const VersionSelectorModal: React.FC<VersionSelectorModalProps> = ({
    entry,
    activeVersionId,
    onClose,
    onSelectVersion,
    onDeleteVersion,
    onRenameVersion
}) => {
    const [renamingVersionId, setRenamingVersionId] = useState<string | null>(null);
    const [renamingVersionName, setRenamingVersionName] = useState('');

    const sortedVersions = (Object.values(entry.versions) as Version[]).sort((a, b) => b.timestamp - a.timestamp);

    const handleConfirmRename = (versionId: string) => {
        onRenameVersion(versionId, renamingVersionName);
        setRenamingVersionId(null);
        setRenamingVersionName('');
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Version History</h3>
                <div className="modal-body">
                    <ul className="version-selector-list">
                        {sortedVersions.map(version => (
                            <li key={version.id} className={`version-selector-item ${version.id === activeVersionId ? 'active' : ''}`}>
                                {renamingVersionId === version.id ? (
                                    <form className="version-rename-form" onSubmit={(e) => { e.preventDefault(); handleConfirmRename(version.id); }}>
                                        <input
                                            type="text"
                                            value={renamingVersionName}
                                            onChange={(e) => setRenamingVersionName(e.target.value)}
                                            className="modal-input"
                                            autoFocus
                                            onBlur={() => setRenamingVersionId(null)}
                                        />
                                        <button type="submit" className="button-create small">Save</button>
                                    </form>
                                ) : (
                                    <>
                                        <div className="version-info">
                                            <span className="version-name">{version.name}</span>
                                            <span className="version-timestamp">{new Date(version.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="version-item-actions">
                                            <button className="version-action-button" onClick={() => onSelectVersion(version.id)} disabled={version.id === activeVersionId}>Select</button>
                                            <button className="version-action-button" onClick={() => { setRenamingVersionId(version.id); setRenamingVersionName(version.name); }}>Rename</button>
                                            <button 
                                                className="version-action-button danger" 
                                                onClick={(e) => { e.stopPropagation(); onDeleteVersion(version.id); }} 
                                                disabled={Object.keys(entry.versions).length <= 1}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="modal-actions">
                    <button type="button" className="button-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default VersionSelectorModal;