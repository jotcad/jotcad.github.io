/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A view component that renders the list of Points of View (POVs) for a given book.
 * Each POV is displayed as a card showing its title and a count of its entries.
 */

import React from 'react';
import { Pov } from '../../types/types.ts';

interface PovListViewProps {
    povs: Record<string, Pov>;
    onSelectPov: (povId: string) => void;
    onDeletePov: (povId: string, povName: string) => void;
}

const PovListView: React.FC<PovListViewProps> = ({ povs, onSelectPov, onDeletePov }) => {
    return (
        <div className="book-list-container">
            {Object.entries(povs).map(([povId, pov]: [string, Pov]) => {
                const entryCount = Object.keys(pov.entries || {}).length;
                return (
                    <div key={povId} className="book-card">
                        <div className="card-main-content" onClick={() => onSelectPov(povId)} tabIndex={0}>
                            <h2 className="book-card-title">{pov.title || 'Untitled POV'}</h2>
                            <p className="book-card-preview">{entryCount} {entryCount === 1 ? 'Entry' : 'Entries'}</p>
                        </div>
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onDeletePov(povId, pov.title || 'Untitled POV');
                            }} 
                            className="delete-book-button" 
                            aria-label={`Delete Point of View: ${pov.title || 'Untitled POV'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default PovListView;