/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * The main text editor view component for the 'Author' application.
 * This component provides a simple, distraction-free textarea for writing content.
 */

import React from 'react';
import { Entry, Book } from '../../types/types.ts';
import EntryComponent from '../Entry.tsx';
import EditorSidebar from './EditorSidebar.tsx';

interface EditorViewProps {
    selectedEntry: Entry;
    selectedBook: Book;
    selectedBookId: string | null;
    onTextChange: (newText: string) => void;
    onSocketAdd: (type: 'input' | 'output', label: string) => void;
    onSocketChange: (type: 'input' | 'output', oldLabel: string, newLabel: string) => void;
    onSocketDelete: (type: 'input' | 'output', label: string) => void;
    onSelectEntry: (bookId: string, povId: string, entryId: string) => void;
    disabled: boolean;
}

const EditorView: React.FC<EditorViewProps> = (props) => {
    return (
        <div className="editor-view-layout">
            <main className="editor-main">
                <EntryComponent
                    entry={props.selectedEntry}
                    onTextChange={props.onTextChange}
                    disabled={props.disabled}
                />
            </main>
            <aside className="editor-sidebar">
                <EditorSidebar
                    entry={props.selectedEntry}
                    book={props.selectedBook}
                    bookId={props.selectedBookId}
                    onSelectEntry={props.onSelectEntry}
                    onSocketAdd={props.onSocketAdd}
                    onSocketChange={props.onSocketChange}
                    onSocketDelete={props.onSocketDelete}
                />
            </aside>
        </div>
    );
};

export default EditorView;