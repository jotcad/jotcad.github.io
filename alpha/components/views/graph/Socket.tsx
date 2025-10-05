/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component that renders a single input or output socket on an EntryNode.
 * It handles displaying the socket's label, its puzzle-piece visual, and the
 * handle for creating connections. It also contains the logic for inline editing
 * of the socket's label.
 */

import React from 'react';
import { SocketPosition, SocketSide } from './types';
import { GraphNode } from '../../../types/types';

interface SocketProps {
    node: GraphNode;
    label: string;
    type: 'input' | 'output';
    position: SocketPosition;
    side: SocketSide;
    isOccupied: boolean;
    isDropTarget: boolean;
    isEditing: boolean;
    currentValue: string;
    inlinedState: { value: string; title: string; relationshipId: string; bookId: string; } | null;
    onValueChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onLabelMouseDown: (e: React.MouseEvent) => void;
    onUpdateInlinedValue: (relationshipId: string, newContent: string, bookId: string) => void;
    onToggleRelationshipInlined: (relationshipId: string, bookId: string, targetNode: GraphNode) => void;
}

const INLINE_CHAR_LIMIT = 30;

const Socket: React.FC<SocketProps> = ({
    node,
    label,
    type,
    position,
    side,
    isOccupied,
    isDropTarget,
    isEditing,
    currentValue,
    inlinedState,
    onValueChange,
    onKeyDown,
    onBlur,
    onLabelMouseDown,
    onUpdateInlinedValue,
    onToggleRelationshipInlined,
}) => {
    if (inlinedState) {
        const isLarge = inlinedState.value.length > INLINE_CHAR_LIMIT;

        const ejectButton = (
             <button 
                className="socket-eject-button" 
                onClick={() => onToggleRelationshipInlined(inlinedState.relationshipId, inlinedState.bookId, node)}
                onMouseDown={e => e.stopPropagation()}
                title="Eject to a separate node"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </button>
        );
        
        return (
             <div
                className={`socket ${type} inlined ${isLarge ? 'large' : ''}`}
                data-socket-id={`${node.id}::${type}::${label}`}
                data-socket-type={type}
                data-socket-position={position}
                data-socket-side={side}
                data-node-id={node.id}
                data-socket-label={label}
            >
                {isLarge ? (
                    <div className="socket-inlined-node">
                        <div className="socket-inlined-node-title" title={inlinedState.title}>{inlinedState.title}</div>
                        <div className="socket-inlined-node-content" title={inlinedState.value}>{inlinedState.value}</div>
                        {ejectButton}
                    </div>
                ) : (
                    <div className="socket-inlined-content">
                        {type === 'input' ? (
                            <input
                                type="text"
                                className="socket-inlined-input"
                                value={inlinedState.value}
                                onChange={(e) => onUpdateInlinedValue(inlinedState.relationshipId, e.target.value, inlinedState.bookId)}
                                onKeyDown={e => e.stopPropagation()}
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                                aria-label={`Inlined value for ${label}`}
                            />
                        ) : (
                            <div className="socket-inlined-display" title={inlinedState.value}>
                                {inlinedState.value || '...'}
                            </div>
                        )}
                        {ejectButton}
                    </div>
                )}

                <div className={`socket-handle occupied`}></div> 
            </div>
        );
    }
    
    return (
        <div
            className={`socket ${type} ${isOccupied ? 'occupied' : ''}`}
            data-socket-id={`${node.id}::${type}::${label}`}
            data-socket-type={type}
            data-socket-position={position}
            data-socket-side={side}
            data-node-id={node.id}
            data-socket-label={label}
        >
            {isEditing ? (
                <div className="socket-edit-form">
                    <input
                        type="text"
                        className="socket-edit-input"
                        value={currentValue}
                        placeholder="Socket name..."
                        onChange={(e) => onValueChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        onBlur={onBlur}
                        autoFocus
                    />
                </div>
            ) : (
                <span className="socket-label" onMouseDown={onLabelMouseDown}>
                    {label}
                </span>
            )}
            <div className={`socket-handle ${isOccupied ? 'occupied' : ''} ${isDropTarget ? 'drop-target' : ''}`}></div>
        </div>
    );
};

export default Socket;