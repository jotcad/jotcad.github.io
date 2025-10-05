/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A sidebar component for the editor view that displays an entry's connections.
 * It lists all input and output sockets and provides direct links to any connected entries.
 */

import React, { useMemo, useState } from 'react';
import { Entry, Book, Pov } from '../../types/types.ts';

interface EditorSidebarProps {
    entry: Entry;
    book: Book;
    bookId: string | null;
    onSelectEntry: (bookId: string, povId: string, entryId: string) => void;
    onSocketAdd: (type: 'input' | 'output', label: string) => void;
    onSocketChange: (type: 'input' | 'output', oldLabel: string, newLabel: string) => void;
    onSocketDelete: (type: 'input' | 'output', label: string) => void;
}

const SocketSection: React.FC<{
    type: 'input' | 'output';
    icon: React.ReactNode;
    sockets: any[]; // The structure from useMemo
    bookId: string | null;
    onSelectEntry: (bookId: string, povId: string, entryId: string) => void;
    onSocketAdd: (type: 'input' | 'output', label: string) => void;
    onSocketChange: (type: 'input' | 'output', oldLabel: string, newLabel: string) => void;
    onSocketDelete: (type: 'input' | 'output', label: string) => void;
    isEditingDisabled?: boolean;
}> = (props) => {
    const { type, icon, sockets, bookId, onSelectEntry, onSocketAdd, onSocketChange, onSocketDelete, isEditingDisabled } = props;
    const [newSocketValue, setNewSocketValue] = useState('');
    const [editingSocket, setEditingSocket] = useState<{ oldLabel: string, newLabel: string } | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSocketValue.trim()) {
            onSocketAdd(type, newSocketValue.trim());
            setNewSocketValue('');
        }
    };
    
    const handleEditBlur = () => {
        if (editingSocket) {
            onSocketChange(type, editingSocket.oldLabel, editingSocket.newLabel);
            setEditingSocket(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleEditBlur();
        } else if (e.key === 'Escape') {
            setEditingSocket(null);
        }
    };

    return (
        <div className="sidebar-section">
            <ul>
                {sockets.length === 0 && <li className="sidebar-no-sockets-placeholder">None</li>}
                {sockets.map(socket => {
                    const isEditing = editingSocket?.oldLabel === socket.socketLabel;
                    const isConnectedInput = type === 'input' && socket.connectedEntry;
                    const connectedOutputs = type === 'output' ? socket.connectedEntries || [] : [];
                    const isSingleOutput = connectedOutputs.length === 1;
                    const isMultiOutput = connectedOutputs.length > 1;

                    const renderLabel = () => {
                        if (isEditing) {
                            return (
                                <input
                                    type="text"
                                    value={editingSocket.newLabel}
                                    onChange={(e) => setEditingSocket({ ...editingSocket, newLabel: e.target.value })}
                                    onBlur={handleEditBlur}
                                    onKeyDown={handleKeyDown}
                                    className="sidebar-socket-edit-input"
                                    autoFocus
                                />
                            );
                        }

                        if (isConnectedInput) {
                            return (
                                 <a
                                    href={`#/view=editor&bookId=${bookId}&povId=${socket.connectedEntry.povId}&entryId=${socket.connectedEntry.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectEntry(bookId!, socket.connectedEntry.povId, socket.connectedEntry.id);
                                    }}
                                    className="socket-label-sidebar link"
                                    title={`Connected from: ${socket.connectedEntry.sourceSocketLabel || 'Untitled Source'}`}
                                >
                                    {socket.socketLabel}
                                </a>
                            );
                        }

                        if (isSingleOutput) {
                            const conn = connectedOutputs[0];
                            return (
                                <a
                                    href={`#/view=editor&bookId=${bookId}&povId=${conn.povId}&entryId=${conn.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSelectEntry(bookId!, conn.povId, conn.id);
                                    }}
                                    className="socket-label-sidebar link"
                                    title={`Connected to: ${conn.title} (${conn.targetSocketLabel})`}
                                >
                                    {socket.socketLabel}
                                </a>
                            );
                        }

                        return (
                             <span
                                className="socket-label-sidebar"
                                onDoubleClick={() => !isEditingDisabled && setEditingSocket({ oldLabel: socket.socketLabel, newLabel: socket.socketLabel })}
                                title={!isEditingDisabled ? "Double-click to edit" : undefined}
                            >
                                {socket.socketLabel}
                            </span>
                        );
                    };

                    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const [povId, entryId] = e.target.value.split('|');
                        if (povId && entryId) {
                            onSelectEntry(bookId!, povId, entryId);
                            e.target.value = ''; // Reset select after navigation
                        }
                    };

                    return (
                        <li key={socket.socketLabel} className="sidebar-socket-item">
                            <div className="sidebar-socket-info">
                                {icon}
                                {renderLabel()}
                                {isMultiOutput && (
                                     <select className="sidebar-socket-jumplist" onChange={handleSelectChange} defaultValue="">
                                        <option value="" disabled>
                                            {connectedOutputs.length} links
                                        </option>
                                        {connectedOutputs.map((conn: any) => (
                                            <option key={conn.id} value={`${conn.povId}|${conn.id}`}>
                                                {conn.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {!isEditing && !isEditingDisabled && (
                                <button className="sidebar-socket-delete-btn" onClick={() => onSocketDelete(type, socket.socketLabel)}>&times;</button>
                            )}
                        </li>
                    );
                })}
            </ul>
            {!isEditingDisabled && (
                <form onSubmit={handleAdd} className="sidebar-add-socket-form">
                    <input
                        type="text"
                        value={newSocketValue}
                        onChange={(e) => setNewSocketValue(e.target.value)}
                        placeholder={`New ${type}...`}
                    />
                    <button type="submit">+</button>
                </form>
            )}
        </div>
    );
};

const EditorSidebar: React.FC<EditorSidebarProps> = ({ entry, book, bookId, onSelectEntry, onSocketAdd, onSocketChange, onSocketDelete }) => {

    const connections = useMemo(() => {
        const allEntriesMap = new Map<string, { entry: Entry, povId: string }>();
        Object.entries(book.povs).forEach(([povId, pov]: [string, Pov]) => {
            Object.values(pov.entries).forEach((e: Entry) => {
                allEntriesMap.set(e.id, { entry: e, povId });
            });
        });

        const inputs: { socketLabel: string, connectedEntry?: any }[] = (entry.inputs || []).map(label => ({ socketLabel: label }));
        const outputs: { socketLabel: string, connectedEntries: any[] }[] = (entry.outputs || []).map(label => ({ socketLabel: label, connectedEntries: [] }));

        (book.relationships || []).forEach(rel => {
            // Check for incoming connections to this entry's inputs
            if (rel.targetEntryId === entry.id) {
                const inputSocket = inputs.find(i => i.socketLabel === rel.targetLabel);
                const sourceEntryInfo = allEntriesMap.get(rel.sourceEntryId);
                if (inputSocket && sourceEntryInfo) {
                    inputSocket.connectedEntry = {
                        id: sourceEntryInfo.entry.id,
                        title: sourceEntryInfo.entry.versions[sourceEntryInfo.entry.activeVersionId].title || 'Untitled',
                        povId: sourceEntryInfo.povId,
                        sourceSocketLabel: rel.sourceLabel,
                    };
                }
            }
            // Check for outgoing connections from this entry's outputs
            if (rel.sourceEntryId === entry.id) {
                const outputSocket = outputs.find(o => o.socketLabel === rel.sourceLabel);
                const targetEntryInfo = allEntriesMap.get(rel.targetEntryId);
                if (outputSocket && targetEntryInfo) {
                    outputSocket.connectedEntries.push({
                        id: targetEntryInfo.entry.id,
                        title: targetEntryInfo.entry.versions[targetEntryInfo.entry.activeVersionId].title || 'Untitled',
                        povId: targetEntryInfo.povId,
                        targetSocketLabel: rel.targetLabel,
                    });
                }
            }
        });

        return { inputs, outputs };
    }, [entry, book]);

    const inputIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
    );
    const outputIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
    );

    if (!bookId) return null;

    const isSocketEditingDisabled = entry.type === 'input' || entry.type === 'output';

    return (
        <div className="sidebar-content">
             <SocketSection
                type="input"
                icon={inputIcon}
                sockets={connections.inputs}
                bookId={bookId}
                onSelectEntry={onSelectEntry}
                onSocketAdd={onSocketAdd}
                onSocketChange={onSocketChange}
                onSocketDelete={onSocketDelete}
                isEditingDisabled={isSocketEditingDisabled}
            />
             <SocketSection
                type="output"
                icon={outputIcon}
                sockets={connections.outputs}
                bookId={bookId}
                onSelectEntry={onSelectEntry}
                onSocketAdd={onSocketAdd}
                onSocketChange={onSocketChange}
                onSocketDelete={onSocketDelete}
                isEditingDisabled={isSocketEditingDisabled}
            />
        </div>
    );
};

export default EditorSidebar;