/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * The main header component for the 'Author' application.
 *
 * This component is responsible for rendering the top navigation bar, which includes
 * back buttons, editable titles for the current context (book, POV, or entry),
 * action buttons (e.g., 'Add New', 'Save Version'), and the synchronization status indicator.
 * It receives all its data and callbacks as props from the main App component.
 */

import React from 'react';
import { Books, Entry } from '../types/types.ts';

interface HeaderProps {
    view: 'list' | 'povList' | 'entryList' | 'editor' | 'graph' | 'globalGraph';
    books: Books | null;
    selectedBookId: string | null;
    selectedPovId: string | null;
    selectedEntry: Entry | null;
    tokenClient: any;
    accessToken: string | null;
    isSynced: boolean;
    bookTitleInputRef: React.RefObject<HTMLInputElement>;
    povTitleInputRef: React.RefObject<HTMLInputElement>;
    entryTitleInputRef: React.RefObject<HTMLInputElement>;
    onBack: () => void;
    onNavigateToGraph: () => void;
    onNavigateToPovList: () => void;
    onNavigateToGlobalGraph: () => void;
    onNavigateToList: () => void;
    onEntryTitleChange: (newTitle: string) => void;
    onEntryTypeChange: (newType: 'prose' | 'js' | 'nl') => void;
    onBookTitleChange: (newTitle: string) => void;
    onPovTitleChange: (newTitle: string) => void;
    onAddNewBook: () => void;
    onAddNewPov: () => void;
    onAddNewEntry: () => void;
    onOpenSaveVersionModal: () => void;
    onOpenVersionSelector: () => void;
    onOpenSettings: () => void;
    onOpenRelationshipModal: () => void;
    onSignIn: () => void;
    onSignOut: () => void;
    onManualSync: () => void;
}

const Header: React.FC<HeaderProps> = (props) => {
    const {
        view, books, selectedBookId, selectedPovId, selectedEntry,
        tokenClient, accessToken, isSynced,
        bookTitleInputRef, povTitleInputRef, entryTitleInputRef,
        onBack, onNavigateToGraph, onNavigateToPovList, onNavigateToGlobalGraph, onNavigateToList,
        onEntryTitleChange, onEntryTypeChange, onBookTitleChange, onPovTitleChange,
        onAddNewBook, onAddNewPov, onAddNewEntry,
        onOpenSaveVersionModal, onOpenVersionSelector, onOpenSettings, onOpenRelationshipModal,
        onSignIn, onSignOut, onManualSync
    } = props;
    
    const handleSyncButtonClick = () => {
        if (!accessToken) {
            onSignIn();
        } else if (!isSynced) {
            onManualSync();
        } else {
            onSignOut();
        }
    };

    const activeVersionTitle = selectedEntry ? selectedEntry.versions[selectedEntry.activeVersionId]?.title ?? '' : '';

    const renderCenterContent = () => {
        if (view === 'editor' && selectedEntry) {
            return (
                <div className="header-title-wrapper">
                    {selectedEntry.dirty && (
                        <span className="dirty-indicator" title="This entry's inputs have changed and it may need updates."></span>
                    )}
                    <select
                        className="header-type-selector"
                        value={selectedEntry.type || 'prose'}
                        onChange={(e) => onEntryTypeChange(e.target.value as 'prose' | 'js' | 'nl')}
                        aria-label="Entry Type"
                    >
                        <option value="prose">Prose</option>
                        <option value="js">JS</option>
                        <option value="nl">NL</option>
                    </select>
                    <input
                        id="entryTitleInput"
                        ref={entryTitleInputRef}
                        type="text"
                        className="header-title-input"
                        value={activeVersionTitle}
                        onChange={(e) => onEntryTitleChange(e.target.value)}
                        placeholder="Untitled Entry"
                        aria-label="Entry Title"
                    />
                </div>
            );
        }
        if (['povList', 'graph'].includes(view) && selectedBookId && books?.[selectedBookId]) {
            return (
                <div className="header-title-wrapper">
                    <label className="header-title-label" htmlFor="bookTitleInput">Book:</label>
                    <input
                        id="bookTitleInput"
                        ref={bookTitleInputRef}
                        type="text"
                        className="header-title-input"
                        value={books[selectedBookId].title}
                        onChange={(e) => onBookTitleChange(e.target.value)}
                        placeholder="Untitled Book"
                        aria-label="Book Title"
                    />
                </div>
            );
        }
        if (view === 'entryList' && selectedBookId && selectedPovId && books?.[selectedBookId]?.povs?.[selectedPovId]) {
            return (
                <div className="header-title-wrapper">
                    <label className="header-title-label" htmlFor="povTitleInput">PoV:</label>
                    <input
                        id="povTitleInput"
                        ref={povTitleInputRef}
                        type="text"
                        className="header-title-input"
                        value={books[selectedBookId].povs[selectedPovId].title}
                        onChange={(e) => onPovTitleChange(e.target.value)}
                        placeholder="Untitled POV"
                        aria-label="Point of View Title"
                    />
                </div>
            );
        }
        return (
            <h1>
                {view === 'list' ? 'Author' :
                 view === 'globalGraph' ? 'All Books' :
                 view === 'povList' || view === 'graph' ? (books?.[selectedBookId]?.title || 'Book') :
                 view === 'entryList' ? (books?.[selectedBookId]?.povs?.[selectedPovId]?.title || 'Point of View') :
                 'Author'
                }
            </h1>
        );
    };

    return (
        <header className="app-header">
            <div className="header-left">
                {!['list', 'globalGraph'].includes(view) && (
                    <button onClick={onBack} className="header-back-button" aria-label="Back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                )}
            </div>
            <div className="header-center">
                {renderCenterContent()}
            </div>
            <div className="header-right">
                {view === 'list' && books !== null && (
                    <button onClick={onAddNewBook} className="header-button" aria-label="Add New Book">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>+ Book</span>
                    </button>
                )}
                 {view === 'povList' && (
                    <button onClick={onAddNewPov} className="header-button" aria-label="Add New Point of View">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>+ POV</span>
                    </button>
                )}
                 {view === 'entryList' && (
                    <button onClick={onAddNewEntry} className="header-button" aria-label="Add New Entry">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>+ Entry</span>
                    </button>
                )}
                {['list', 'globalGraph'].includes(view) && (
                     <div className="view-toggle-group">
                        <button onClick={onNavigateToList} className={`view-toggle-button ${view === 'list' ? 'active' : ''}`} title="List View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            <span>List</span>
                        </button>
                        <button onClick={onNavigateToGlobalGraph} className={`view-toggle-button ${view === 'globalGraph' ? 'active' : ''}`} title="Graph View">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>Graph</span>
                        </button>
                    </div>
                )}
                {['povList', 'graph'].includes(view) && (
                     <div className="view-toggle-group">
                        <button onClick={onNavigateToPovList} className={`view-toggle-button ${view === 'povList' ? 'active' : ''}`} title="List View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            <span>List</span>
                        </button>
                        <button onClick={onNavigateToGraph} className={`view-toggle-button ${view === 'graph' ? 'active' : ''}`} title="Graph View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>Graph</span>
                        </button>
                    </div>
                )}
                 {(view === 'graph' || view === 'globalGraph') && (
                    <button onClick={onOpenRelationshipModal} className="header-button" aria-label="Add New Relationship" disabled={view === 'globalGraph'}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <span>+ Link</span>
                    </button>
                )}
                {view === 'editor' && (
                    <div className="header-actions">
                        <button onClick={onNavigateToGraph} className="header-button icon-button" title="Graph View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                        <button onClick={onOpenSaveVersionModal} className="header-button icon-button" title="Save Version">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        </button>
                        <button onClick={onOpenVersionSelector} className="header-button icon-button" title="Versions">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        </button>
                    </div>
                )}
                {view === 'list' && accessToken && (
                     <button onClick={onOpenSettings} className="header-button icon-button" aria-label="Settings">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
                )}
                 <button
                    onClick={handleSyncButtonClick}
                    className="header-button icon-button"
                    disabled={!accessToken && !tokenClient}
                    aria-label={
                        !accessToken
                            ? `Status: Offline${!isSynced ? ' with unsaved changes' : ''}. Click to sign in.`
                            : isSynced
                                ? 'Status: Synced. Click to sign out.'
                                : 'Status: Unsynced. Click to sync now.'
                    }
                    title={
                        !accessToken ? 'Sign In' :
                        isSynced ? 'Sign Out' :
                        'Sync Now'
                    }
                >
                    <div
                        className={`sync-status-wrapper ${!isSynced ? 'has-unsynced-ring' : ''}`}
                        title={
                            !accessToken
                                ? `Status: Offline${!isSynced ? ' with unsaved local changes' : ''}`
                                : `Status: ${isSynced ? 'Synced' : 'Unsynced Changes'}`
                        }
                    >
                        <span className={`status-indicator-dot ${!accessToken ? 'offline' : 'online'}`}></span>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;