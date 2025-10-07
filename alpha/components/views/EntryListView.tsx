/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A view component that renders the list of entries for a given Point of View (POV).
 * Each entry is displayed as a card with its title and a short preview of its content.
 */

import React from 'react';
import { Entry } from '../../types/types.ts';

interface EntryListViewProps {
    entries: Record<string, Entry>;
    onSelectEntry: (entryId: string) => void;
    onDeleteEntry: (entryId: string, entryName: string) => void;
}

const getActiveVersionContent = (entry: Entry): string => {
    if (!entry || !entry.versions || !entry.activeVersionId) return '';
    const activeVersion = entry.versions[entry.activeVersionId];
    return activeVersion ? activeVersion.content : '';
};

const getActiveVersionTitle = (entry: Entry): string => {
    if (!entry || !entry.versions || !entry.activeVersionId) return '';
    const activeVersion = entry.versions[entry.activeVersionId];
    return activeVersion ? activeVersion.title : '';
};

const EntryListView: React.FC<EntryListViewProps> = ({ entries, onSelectEntry, onDeleteEntry }) => {
    return (
        <div className="book-list-container">
            {Object.entries(entries).map(([entryId, entry]: [string, Entry]) => {
                const title = getActiveVersionTitle(entry) || 'Untitled Entry';
                const preview = getActiveVersionContent(entry).substring(0, 100) || 'Empty';
                return (
                    <div key={entryId} className={`book-card ${entry.conflict ? 'conflicted' : ''}`}>
                        <div className="card-main-content" onClick={() => onSelectEntry(entryId)} tabIndex={0}>
                            <h2 className="book-card-title">
                                {entry.conflict && <span className="conflict-indicator" title="Sync Conflict: Edit to resolve">!</span>}
                                {entry.dirty && <span className="dirty-indicator" title="This entry's inputs have changed and it may need updates."></span>}
                                {title}
                            </h2>
                            <p className="book-card-preview">{preview}</p>
                        </div>
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onDeleteEntry(entryId, title);
                            }} 
                            className="delete-book-button" 
                            aria-label={`Delete Entry: ${title}`}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default EntryListView;