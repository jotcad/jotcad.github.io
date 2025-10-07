/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * The main text editor view component for the 'Author' application.
 * This component provides a simple, distraction-free textarea for writing content.
 */

import React, { useState } from 'react';
import { Entry, Book } from '../../types/types.ts';
import EntryComponent from '../Entry.tsx';
import EditorSidebar from './EditorSidebar.tsx';

interface EditorViewProps {
    selectedEntry: Entry;
    selectedBook: Book;
    selectedBookId: string | null;
    selectedPovId: string | null;
    entryContentAsHtml?: string;
    onTextChange: (newText: string) => void;
    onSocketAdd: (type: 'input' | 'output', label: string) => void;
    onSocketChange: (type: 'input' | 'output', oldLabel: string, newLabel: string) => void;
    onSocketDelete: (type: 'input' | 'output', label: string) => void;
    onSelectEntry: (bookId: string, povId: string, entryId: string) => void;
    onPovChange: (newPovId: string) => void;
    onRevertToCloud: () => void;
    onOverrideCloud: () => void;
    onSaveMergedConflict: () => void;
    onEntryTypeChange: (newType: 'prose' | 'js' | 'nl') => void;
    disabled: boolean;
}

const EditorView: React.FC<EditorViewProps> = (props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 900);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`editor-view-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <main className="editor-main" onClick={() => { if(window.innerWidth <= 900 && isSidebarOpen) { toggleSidebar(); } }}>
                <EntryComponent
                    entry={props.selectedEntry}
                    entryContentAsHtml={props.entryContentAsHtml}
                    onTextChange={props.onTextChange}
                    disabled={props.disabled}
                />
            </main>

            <div 
                className="editor-sidebar-divider"
                onClick={toggleSidebar}
                role="button"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                tabIndex={0}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </div>

            <aside className="editor-sidebar">
                <EditorSidebar
                    entry={props.selectedEntry}
                    book={props.selectedBook}
                    bookId={props.selectedBookId}
                    selectedPovId={props.selectedPovId}
                    onSelectEntry={props.onSelectEntry}
                    onSocketAdd={props.onSocketAdd}
                    onSocketChange={props.onSocketChange}
                    onSocketDelete={props.onSocketDelete}
                    onPovChange={props.onPovChange}
                    onRevertToCloud={props.onRevertToCloud}
                    onOverrideCloud={props.onOverrideCloud}
                    onSaveMergedConflict={props.onSaveMergedConflict}
                    onEntryTypeChange={props.onEntryTypeChange}
                />
            </aside>
        </div>
    );
};

export default EditorView;