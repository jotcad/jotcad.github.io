/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component that renders a single entry as a node within the GraphView.
 * It is responsible for displaying the node's title, its input and output sockets,
 * and action buttons for generating ideas, deleting the node, or adding new sockets.
 */

import React from 'react';
import { GraphNode } from '../../../types/types.ts';
import Socket from './Socket.tsx';
import { SocketPosition, SocketSide, SocketInfo } from './types.ts';

interface EntryNodeProps {
    node: GraphNode & { x: number, y: number }; // position is guaranteed here
    povTitle?: string;
    renderableSocketsForNode: { [key in SocketSide]: SocketInfo[] };
    socketPositionLayoutForNode: { inputs: Map<string, SocketPosition>; outputs: Map<string, SocketPosition> };
    occupiedInputSockets: Set<string>;
    newConnection: { dragFrom: 'input' | 'output' } | null;
    inlineEditingSocket: { nodeId: string; type: 'input' | 'output'; label: string; currentValue: string; } | null;
    inlinedInputValues: Map<string, { value: string; title: string; sourceEntryId: string; relationshipId: string; bookId: string; }>;
    inlinedOutputValues: Map<string, { value: string; title: string; targetEntryId: string; relationshipId: string; bookId: string; }>;
    onDeleteEntry: (node: GraphNode) => void;
    onGenerateIdeas: (sourceNode: GraphNode) => void;
    onRecomputeCode: (sourceNode: GraphNode) => void;
    onRecomputeNL: (sourceNode: GraphNode) => void;
    onNodeContentChange: (node: GraphNode, newContent: string) => void;
    onAddSocket: (node: GraphNode, type: 'input' | 'output', tempLabel: string) => void;
    // FIX: Updated the type to React.Dispatch<React.SetStateAction<...>> to allow passing functional updates to the state setter.
    setInlineEditingSocket: React.Dispatch<React.SetStateAction<{ nodeId: string; type: 'input' | 'output'; label: string; currentValue: string; } | null>>;
    handleKeyDownOnSocketInput: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleSocketInputBlur: () => void;
    ignoreNextBlur: React.MutableRefObject<boolean>;
    onUpdateInlinedValue: (relationshipId: string, newContent: string, bookId: string) => void;
    onToggleRelationshipInlined: (relationshipId: string, bookId: string, targetNode: GraphNode) => void;
}

const EntryNode: React.FC<EntryNodeProps> = ({
    node,
    povTitle,
    renderableSocketsForNode,
    socketPositionLayoutForNode,
    occupiedInputSockets,
    newConnection,
    inlineEditingSocket,
    inlinedInputValues,
    inlinedOutputValues,
    onDeleteEntry,
    onGenerateIdeas,
    onRecomputeCode,
    onRecomputeNL,
    onNodeContentChange,
    onAddSocket,
    setInlineEditingSocket,
    handleKeyDownOnSocketInput,
    handleSocketInputBlur,
    ignoreNextBlur,
    onUpdateInlinedValue,
    onToggleRelationshipInlined
}) => {
    if (node.type === 'input') {
        return (
            <div
                key={node.id}
                data-id={node.id}
                className="entry-node entry-node--input"
                style={{ top: `${node.y}px`, left: `${node.x}px` }}
            >
                <div className="entry-node--input-raw">
                    <div className="raw-input-wrapper">
                        {/* This span is hidden but dictates the size. Use 'pre' to preserve whitespace. */}
                        <span className="raw-input-sizer" aria-hidden="true">
                            {node.content}
                        </span>
                        <input
                            type="text"
                            className="raw-input-field"
                            value={node.content || ''}
                            onChange={(e) => onNodeContentChange(node, e.target.value)}
                            aria-label="Input value"
                            placeholder="..."
                        />
                    </div>
                    <div
                        className="raw-socket-wrapper"
                        data-socket-id={`${node.id}::output::value`}
                        data-socket-type="output"
                        data-socket-position="right"
                        data-socket-side="right"
                        data-node-id={node.id}
                        data-socket-label="value"
                    >
                        <div className="socket-handle"></div>
                    </div>
                    <button className="delete-entry-node-button" onMouseDown={(e) => { e.stopPropagation(); onDeleteEntry(node); }} aria-label={`Delete entry: ${node.title || 'value node'}`}>
                        &times;
                    </button>
                </div>
            </div>
        );
    } else if (node.type === 'output') {
        return (
            <div
                key={node.id}
                data-id={node.id}
                className="entry-node entry-node--output"
                style={{ top: `${node.y}px`, left: `${node.x}px` }}
            >
                <div className="entry-node--output-raw">
                    <button
                        className="delete-entry-node-button"
                        onMouseDown={(e) => { e.stopPropagation(); onDeleteEntry(node); }}
                        aria-label={`Delete entry: ${node.title || 'output node'}`}
                    >
                        &times;
                    </button>
                    <div
                        className="raw-socket-wrapper--input"
                        data-socket-id={`${node.id}::input::value`}
                        data-socket-type="input"
                        data-socket-position="left"
                        data-socket-side="left"
                        data-node-id={node.id}
                        data-socket-label="value"
                    >
                        <div className="socket-handle"></div>
                    </div>
                    <div className="raw-output-wrapper">
                        <span className="raw-output-sizer" aria-hidden="true">
                            {node.content || '...'}
                        </span>
                        <div className="raw-output-display" title={node.content || ''}>
                            {node.content || '...'}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    const nodeTypeClass = `entry-node--${node.type || 'prose'}`;
    // FIX: After the early returns for 'input' and 'output' node types, any remaining node types
    // have editable sockets. The previous check was redundant.
    const areSocketsEditable = true;
    
    return (
        <div
            key={node.id}
            data-id={node.id}
            className="entry-node"
            style={{ top: `${node.y}px`, left: `${node.x}px` }}
            title={povTitle}
        >
            <div
                className={`entry-node-visuals ${nodeTypeClass} ${node.dirty ? 'dirty' : ''} ${node.conflict ? 'conflicted' : ''}`}
            >
                {(['top', 'right', 'bottom', 'left'] as SocketSide[]).map(side => (
                    <div key={side} className={`socket-container ${side}`}>
                        {renderableSocketsForNode[side].map(socket => {
                            const { label, type } = socket;
                            const position = (socketPositionLayoutForNode[`${type}s` as 'inputs' | 'outputs']).get(label)!;
                            const isOccupied = type === 'input' && occupiedInputSockets.has(`${node.id}::${label}`);
                            const isDropTarget = !!newConnection && (
                                (newConnection.dragFrom === 'output' && type === 'input' && !isOccupied) ||
                                (newConnection.dragFrom === 'input' && type === 'output')
                            );
                            const isEditing = !!inlineEditingSocket &&
                                inlineEditingSocket.nodeId === node.id &&
                                inlineEditingSocket.type === type &&
                                inlineEditingSocket.label === label;
                            
                            const inlinedInputState = inlinedInputValues.get(`${node.id}::${label}`);
                            const inlinedOutputState = inlinedOutputValues.get(`${node.id}::${label}`);
                            
                            let finalInlinedState: { value: string, title: string, relationshipId: string, bookId: string } | null = null;

                            if (type === 'input' && inlinedInputState) {
                                finalInlinedState = {
                                    value: inlinedInputState.value,
                                    title: inlinedInputState.title,
                                    relationshipId: inlinedInputState.relationshipId,
                                    bookId: inlinedInputState.bookId,
                                };
                            } else if (type === 'output' && inlinedOutputState) {
                                finalInlinedState = {
                                    value: inlinedOutputState.value,
                                    title: inlinedOutputState.title,
                                    relationshipId: inlinedOutputState.relationshipId,
                                    bookId: inlinedOutputState.bookId,
                                };
                            }

                            return (
                                <Socket
                                    key={`${node.id}-${type}-${label}`}
                                    node={node}
                                    label={label}
                                    type={type}
                                    position={position}
                                    side={side}
                                    isOccupied={isOccupied}
                                    isDropTarget={isDropTarget}
                                    isEditing={isEditing}
                                    currentValue={isEditing ? inlineEditingSocket.currentValue : ''}
                                    inlinedState={finalInlinedState}
                                    onValueChange={(value) => setInlineEditingSocket(s => s ? { ...s, currentValue: value } : null)}
                                    onKeyDown={handleKeyDownOnSocketInput}
                                    onBlur={handleSocketInputBlur}
                                    onLabelMouseDown={(e) => {
                                        if (!areSocketsEditable) return;
                                        e.stopPropagation();
                                        ignoreNextBlur.current = true;
                                        setInlineEditingSocket({
                                            nodeId: node.id,
                                            type: type,
                                            label: label,
                                            currentValue: label,
                                        });
                                    }}
                                    onUpdateInlinedValue={onUpdateInlinedValue}
                                    onToggleRelationshipInlined={onToggleRelationshipInlined}
                                />
                            );
                        })}
                    </div>
                ))}

                <div className="entry-node-body">
                    <div className="entry-node-title">{node.title || 'Untitled Entry'}</div>
                    <div className="entry-node-actions">
                        <button className="generate-ideas-button" onClick={() => onGenerateIdeas(node)} title="Generate related ideas using AI">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.14a8 8 0 0 1 12.86 12.86"/><path d="M12 22a10 10 0 0 0 10-10c0-5.52-4.48-10-10-10a10 10 0 0 0-10 10c0 .44.03.88.08 1.31"/><path d="M12 22a10 10 0 0 1-9.92-8.69"/><path d="M2.5 13.5h5l2.5-4 2.5 4h5"/><path d="m18 19-3-3 3-3"/></svg>
                        </button>
                         {areSocketsEditable && (
                            <button
                                className="add-input-socket-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const tempLabel = `__editing_${Date.now()}`;
                                    onAddSocket(node, 'input', tempLabel);
                                    setInlineEditingSocket({
                                        nodeId: node.id,
                                        type: 'input',
                                        label: tempLabel,
                                        currentValue: '',
                                    });
                                }}
                                title="Add Input"
                            >+ in</button>
                        )}
                        {areSocketsEditable && (
                            <button
                                className="add-output-socket-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const tempLabel = `__editing_${Date.now()}`;
                                    onAddSocket(node, 'output', tempLabel);
                                    setInlineEditingSocket({
                                        nodeId: node.id,
                                        type: 'output',
                                        label: tempLabel,
                                        currentValue: '',
                                    });
                                }}
                                title="Add Output"
                            >+ out</button>
                        )}
                        <button className="delete-entry-node-button" onMouseDown={(e) => { e.stopPropagation(); onDeleteEntry(node); }} aria-label={`Delete entry: ${node.title}`}>
                            &times;
                        </button>
                        {(node.type === 'js' || node.type === 'nl') && node.dirty && (
                            <button
                                className="refresh-button"
                                onClick={() => { node.type === 'js' ? onRecomputeCode(node) : onRecomputeNL(node) }}
                                title={`Re-run ${node.type === 'js' ? 'JS code' : 'NL prompt'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// FIX: Add default export for the EntryNode component.
export default EntryNode;