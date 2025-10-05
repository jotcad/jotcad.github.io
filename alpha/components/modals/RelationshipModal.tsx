/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A modal for creating and editing named relationships between entries.
 */

import React, { useState, useEffect } from 'react';
import { Relationship } from '../../types/types.ts';

type EntryInfo = {
    povId: string;
    povTitle: string;
    entryId: string;
    entryTitle: string;
};

interface RelationshipModalProps {
    relationship: Relationship | 'new' | Partial<Omit<Relationship, 'id'>>;
    allEntries: EntryInfo[];
    onClose: () => void;
    onSave: (data: { id?: string; sourceEntryId: string; targetEntryId: string; sourceLabel: string; targetLabel: string }) => void;
    onDelete: (id: string) => void;
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({ relationship, allEntries, onClose, onSave, onDelete }) => {
    const isEditing = typeof relationship === 'object' && relationship !== null && 'id' in relationship;
    const [sourceEntryId, setSourceEntryId] = useState('');
    const [targetEntryId, setTargetEntryId] = useState('');
    const [sourceLabel, setSourceLabel] = useState('');
    const [targetLabel, setTargetLabel] = useState('');


    useEffect(() => {
        if (typeof relationship === 'object' && relationship !== null) {
            setSourceEntryId(relationship.sourceEntryId || (allEntries[0]?.entryId || ''));
            setTargetEntryId(relationship.targetEntryId || (allEntries[0]?.entryId || ''));
            setSourceLabel(relationship.sourceLabel || '');
            setTargetLabel(relationship.targetLabel || '');
        } else { // 'new'
            if (allEntries.length > 0) {
                setSourceEntryId(allEntries[0]?.entryId || '');
                setTargetEntryId(allEntries[0]?.entryId || '');
            }
            setSourceLabel('');
            setTargetLabel('');
        }
    }, [relationship, allEntries]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sourceEntryId || !targetEntryId || !targetLabel.trim()) {
            alert('Please select a source, target, and provide a target label.');
            return;
        }
        onSave({
            id: isEditing ? (relationship as Relationship).id : undefined,
            sourceEntryId,
            targetEntryId,
            sourceLabel,
            targetLabel,
        });
    };

    const handleDelete = () => {
        if (isEditing) {
            onDelete((relationship as Relationship).id);
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3 className="modal-title">{isEditing ? 'Edit Relationship' : 'Add Relationship'}</h3>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="sourceEntry">Source Entry</label>
                            <select
                                id="sourceEntry"
                                value={sourceEntryId}
                                onChange={(e) => setSourceEntryId(e.target.value)}
                                className="modal-select"
                                required
                            >
                                {allEntries.map(entry => (
                                    <option key={entry.entryId} value={entry.entryId}>
                                        {entry.povTitle}: {entry.entryTitle}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="sourceLabel">Source Label (Optional)</label>
                            <input
                                id="sourceLabel"
                                type="text"
                                value={sourceLabel}
                                onChange={(e) => setSourceLabel(e.target.value)}
                                className="modal-input"
                                placeholder="e.g., Protagonist"
                            />
                        </div>
                         <div className="form-group">
                            <label htmlFor="targetEntry">Target Entry</label>
                            <select
                                id="targetEntry"
                                value={targetEntryId}
                                onChange={(e) => setTargetEntryId(e.target.value)}
                                className="modal-select"
                                required
                            >
                                {allEntries.map(entry => (
                                    <option key={entry.entryId} value={entry.entryId}>
                                        {entry.povTitle}: {entry.entryTitle}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="targetLabel">Target Label</label>
                            <input
                                id="targetLabel"
                                type="text"
                                value={targetLabel}
                                onChange={(e) => setTargetLabel(e.target.value)}
                                className="modal-input"
                                placeholder="e.g., Leads to, Becomes"
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        {isEditing && <button type="button" className="button-delete" onClick={handleDelete}>Delete</button>}
                        <div style={{ flexGrow: 1 }}></div>
                        <button type="button" className="button-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="button-create">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RelationshipModal;