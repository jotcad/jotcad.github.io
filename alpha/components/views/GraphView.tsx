/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A view component that renders a force-directed graph of relationships between entries.
 */

import React, { useRef, useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { Relationship, GraphNode } from '../../types/types.ts';
import EntryNode from './graph/EntryNode.tsx';
import { SocketPosition, SocketSide, SocketInfo } from './graph/types.ts';

interface GraphViewProps {
    nodes: GraphNode[];
    links: any[];
    onSelectEntry: (bookId: string, povId: string, entryId: string) => void;
    onEditRelationship: (relationship: Relationship) => void;
    onDeleteEntry: (node: GraphNode) => void;
    onBackgroundClick: (position: { x: number, y: number }) => void;
    onGenerateIdeas: (sourceNode: GraphNode) => void;
    onRecomputeCode: (sourceNode: GraphNode) => void;
    onRecomputeNL: (sourceNode: GraphNode) => void;
    onNodePositionChange: (node: GraphNode, position: { x: number, y: number }) => void;
    onNodeContentChange: (node: GraphNode, newContent: string) => void;
    onAddRelationshipDirectly: (relationshipData: { sourceEntryId: string; targetEntryId: string; sourceLabel: string; targetLabel: string; bookId: string; }) => void;
    onAddSocket: (node: GraphNode, type: 'input' | 'output', label: string) => void;
    onUpdateSocketLabel: (node: GraphNode, type: 'input' | 'output', oldLabel: string, newLabel: string) => void;
    onAddSocketAndConnect: (data: {
        targetNode: GraphNode;
        newSocketType: 'input' | 'output';
        newSocketLabel: string;
        sourceEntryId: string;
        sourceSocketLabel: string;
        targetSocketLabel: string;
    }) => void;
    onUpdateInlinedValue: (relationshipId: string, newContent: string, bookId: string) => void;
    onToggleRelationshipInlined: (relationshipId: string, bookId: string, referenceNode: GraphNode, forceState?: boolean) => void;
}

// --- Layout Helper Constants ---
const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;


// FIX: Add a type guard to ensure that string values read from DOM data attributes
// are validated against the SocketPosition literal type, resolving a TypeScript error
// where 'string' was not assignable to 'SocketPosition'.
const isSocketPosition = (pos: string | null): pos is SocketPosition => {
    if (!pos) return false;
    return ['top', 'right', 'bottom', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(pos);
};

// FIX: Add new type guard for SocketSide
const isSocketSide = (side: string | null): side is SocketSide => {
    if (!side) return false;
    return ['top', 'right', 'bottom', 'left'].includes(side);
};


const getBezierPointAndAngle = (p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}, p3: {x:number, y:number}, t: number) => {
    const mt = 1 - t;

    // Point calculation using the Bezier formula
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;

    // Derivative (tangent) calculation to find the curve's direction at the point
    const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);

    // Angle calculation from the tangent vector
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { x, y, angle };
};

const pointOnCubicBezier = (p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}, p3: {x:number, y:number}, t: number) => {
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
    return { x, y };
};

const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const getArcLengthData = (p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}, p3: {x:number, y:number}, samples = 100) => {
    let totalLength = 0;
    const lengths = [0];
    let lastPoint = pointOnCubicBezier(p0, p1, p2, p3, 0);

    for (let i = 1; i <= samples; i++) {
        const t = i / samples;
        const currentPoint = pointOnCubicBezier(p0, p1, p2, p3, t);
        totalLength += distance(lastPoint, currentPoint);
        lengths.push(totalLength);
        lastPoint = currentPoint;
    }
    return { lengths, totalLength };
};

const getTForArcLength = (arcLengthData: { lengths: number[], totalLength: number }, targetLength: number) => {
    const { lengths, totalLength } = arcLengthData;
    const samples = lengths.length - 1;

    if (targetLength <= 0) return 0;
    if (targetLength >= totalLength) return 1;

    // Find the segment where the target length falls
    let i = 0;
    while (i < lengths.length && lengths[i] < targetLength) {
        i++;
    }
    
    if (i === 0) return 0;

    // Linear interpolation
    const lengthBefore = lengths[i - 1];
    const lengthAfter = lengths[i];
    const segmentLength = lengthAfter - lengthBefore;

    if (segmentLength === 0) return (i - 1) / samples;

    const segmentRatio = (targetLength - lengthBefore) / segmentLength;
    const tBefore = (i - 1) / samples;
    const tSegment = 1 / samples;

    return tBefore + segmentRatio * tSegment;
};


const getConnectionPoints = (
    sourceSocketRect: DOMRect,
    sourcePosition: SocketPosition,
    sourceSide: SocketSide,
    targetSocketRect: DOMRect,
    targetPosition: SocketPosition,
    targetSide: SocketSide,
    viewRect: DOMRect,
    viewTransform: { x: number, y: number, k: number }
) => {
    const toWorld = (px: number, py: number) => ({
        x: (px - viewRect.left - viewTransform.x) / viewTransform.k,
        y: (py - viewRect.top - viewTransform.y) / viewTransform.k,
    });

    const getAnchorPoint = (rect: DOMRect) => {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return toWorld(cx, cy);
    };

    const sourcePoint = getAnchorPoint(sourceSocketRect);
    const targetPoint = getAnchorPoint(targetSocketRect);

    // Using a fixed handle length to ensure connections always exit sockets
    // in the correct direction with a strong initial curve.
    const handleLen = 60;

    let c1x = sourcePoint.x;
    let c1y = sourcePoint.y;
    let c2x = targetPoint.x;
    let c2y = targetPoint.y;

    // Explicitly calculate source control point based on side
    switch (sourceSide) {
        case 'top':    c1y -= handleLen; break;
        case 'bottom': c1y += handleLen; break;
        case 'left':   c1x -= handleLen; break;
        case 'right':  c1x += handleLen; break;
    }

    // Corrected target control point calculation.
    // The control point (c2) determines the direction from which the curve arrives
    // at the target point. It should be placed on the opposite side of the anchor.
    switch (targetSide) {
        case 'top':    c2y = targetPoint.y - handleLen; break;
        case 'bottom': c2y = targetPoint.y + handleLen; break;
        case 'left':   c2x = targetPoint.x - handleLen; break;
        case 'right':  c2x = targetPoint.x + handleLen; break;
    }

    const pathD = `M${sourcePoint.x},${sourcePoint.y} C${c1x},${c1y} ${c2x},${c2y} ${targetPoint.x},${targetPoint.y}`;

    const p0 = sourcePoint;
    const p1 = { x: c1x, y: c1y };
    const p2 = { x: c2x, y: c2y };
    const p3 = targetPoint;
    
    const arcLengthData = getArcLengthData(p0, p1, p2, p3);
    
    const t1 = getTForArcLength(arcLengthData, arcLengthData.totalLength * 0.33);
    const t2 = getTForArcLength(arcLengthData, arcLengthData.totalLength * 0.66);

    const arrows = [
        getBezierPointAndAngle(p0, p1, p2, p3, t1),
        getBezierPointAndAngle(p0, p1, p2, p3, t2)
    ];
    
    return { pathD, arrows };
};


const GraphView: React.FC<GraphViewProps> = ({
    nodes: memoizedNodes,
    links: memoizedLinks,
    onSelectEntry,
    onEditRelationship,
    onDeleteEntry,
    onBackgroundClick,
    onGenerateIdeas,
    onRecomputeCode,
    onRecomputeNL,
    onNodePositionChange,
    onNodeContentChange,
    onAddRelationshipDirectly,
    onAddSocket,
    onUpdateSocketLabel,
    onAddSocketAndConnect,
    onUpdateInlinedValue,
    onToggleRelationshipInlined
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, k: 1 });
    const ignoreNextBlur = useRef(false);
    
    // State is used for rendering updates
    const [draggedNode, setDraggedNode] = useState<{ id: string, x: number, y: number, offsetX: number, offsetY: number } | null>(null);
    const [newConnection, setNewConnection] = useState<{
        sourceNodeId: string;
        sourceSocketLabel: string;
        sourceX: number;
        sourceY: number;
        endX: number;
        endY: number;
        dragFrom: 'input' | 'output';
        sourcePosition: SocketPosition;
        sourceSide: SocketSide;
    } | null>(null);
    const [inlineEditingSocket, setInlineEditingSocket] = useState<{
        nodeId: string;
        type: 'input' | 'output';
        label: string; // This will be the temporary label
        currentValue: string;
    } | null>(null);


    const getLinkEndpointId = useCallback((endpoint: any): string | null => {
        if (typeof endpoint === 'string') return endpoint;
        if (typeof endpoint === 'object' && endpoint !== null && typeof endpoint.id === 'string') {
            return endpoint.id;
        }
        return null;
    }, []);

    const validLinks = useMemo(() => {
        const nodeIds = new Set(memoizedNodes.map(n => n.id));
        return memoizedLinks.filter(link => {
            if (!link) return false;
            const sourceId = getLinkEndpointId(link.source);
            const targetId = getLinkEndpointId(link.target);
            return sourceId && targetId && nodeIds.has(sourceId) && nodeIds.has(targetId);
        });
    }, [memoizedNodes, memoizedLinks, getLinkEndpointId]);
    
    const occupiedInputSockets = useMemo(() => {
        const occupied = new Set<string>();
        validLinks.forEach(link => {
            const targetId = getLinkEndpointId(link.target);
            if (targetId && link.targetLabel) {
                occupied.add(`${targetId}::${link.targetLabel}`);
            }
        });
        return occupied;
    }, [validLinks, getLinkEndpointId]);
    
    const nodesForDragging = useMemo(() => {
        const defaultPosition = (containerRef.current) 
            ? { x: containerRef.current.clientWidth / 2, y: containerRef.current.clientHeight / 2 } 
            : { x: 0, y: 0 };
        
        return memoizedNodes.map(n => ({
            ...n,
            x: n.id === draggedNode?.id ? draggedNode.x : (n.x ?? defaultPosition.x),
            y: n.id === draggedNode?.id ? draggedNode.y : (n.y ?? defaultPosition.y),
        }));
    }, [memoizedNodes, draggedNode]);

    const collapsedNodeIds = useMemo(() => {
        const ids = new Set<string>();
        const nodeMap = new Map(memoizedNodes.map(n => [n.id, n]));
        validLinks.forEach(link => {
            if (link.isInlined) {
                const sourceId = getLinkEndpointId(link.source);
                const targetId = getLinkEndpointId(link.target);
                const sourceNode = nodeMap.get(sourceId!);
                const targetNode = nodeMap.get(targetId!);

// FIX: Cast sourceNode to GraphNode to resolve error on accessing .type of unknown
                if (sourceNode && (sourceNode as GraphNode).type === 'input') {
                    ids.add(sourceId!);
                }
// FIX: Cast targetNode to GraphNode to resolve error on accessing .type of unknown
                if (targetNode && (targetNode as GraphNode).type === 'output') {
                    ids.add(targetId!);
                }
            }
        });
        return ids;
    }, [validLinks, getLinkEndpointId, memoizedNodes]);

    const finalNodes = useMemo(() => {
        return nodesForDragging.filter(n => !collapsedNodeIds.has(n.id));
    }, [nodesForDragging, collapsedNodeIds]);

    const inlinedInputValues = useMemo(() => {
        const inlinedMap = new Map<string, { value: string, title: string, sourceEntryId: string, relationshipId: string, bookId: string }>();
        const nodeMap = new Map(memoizedNodes.map(n => [n.id, n]));

        validLinks.forEach((link: any) => {
            if (link.isInlined) {
                const sourceId = getLinkEndpointId(link.source);
                const targetId = getLinkEndpointId(link.target);
                const sourceNode = nodeMap.get(sourceId!);

// FIX: Cast sourceNode to GraphNode to resolve error on accessing .type of unknown
                if (sourceId && targetId && link.targetLabel && sourceNode && (sourceNode as GraphNode).type === 'input') {
                    const key = `${targetId}::${link.targetLabel}`;
// FIX: Cast sourceNode to GraphNode to resolve type errors.
                    inlinedMap.set(key, {
                        value: (sourceNode as GraphNode).content || '',
                        title: (sourceNode as GraphNode).title || 'Untitled Input',
                        sourceEntryId: sourceId,
                        relationshipId: link.id,
                        bookId: (sourceNode as GraphNode).bookId,
                    });
                }
            }
        });
        return inlinedMap;
    }, [validLinks, memoizedNodes, getLinkEndpointId]);

    const inlinedOutputValues = useMemo(() => {
        const inlinedMap = new Map<string, { value: string, title: string, targetEntryId: string, relationshipId: string, bookId: string }>();
        const nodeMap = new Map(memoizedNodes.map(n => [n.id, n]));
    
        validLinks.forEach((link: any) => {
            if (link.isInlined) {
                const sourceId = getLinkEndpointId(link.source);
                const targetId = getLinkEndpointId(link.target);
                const targetNode = nodeMap.get(targetId!);
    
// FIX: Cast targetNode to GraphNode to resolve error on accessing .type of unknown
                if (sourceId && targetId && link.sourceLabel && targetNode && (targetNode as GraphNode).type === 'output') {
                    const key = `${sourceId}::${link.sourceLabel}`;
                    inlinedMap.set(key, {
// FIX: Cast targetNode to GraphNode to resolve error on accessing .content of unknown
                        value: (targetNode as GraphNode).content || '',
                        title: (targetNode as GraphNode).title || 'Untitled Output',
                        targetEntryId: targetId,
                        relationshipId: link.id,
// FIX: Cast targetNode to GraphNode to resolve error on accessing .bookId of unknown
                        bookId: (targetNode as GraphNode).bookId,
                    });
                }
            }
        });
        return inlinedMap;
    }, [validLinks, memoizedNodes, getLinkEndpointId]);
    
    const nodePositions = useMemo(() => {
        const positions = new Map<string, {x: number, y: number}>();
        finalNodes.forEach(node => positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 }));
        return positions;
    }, [finalNodes]);

    const { socketPositionLayout, renderableSockets } = useMemo(() => {
        const updatedNodes = memoizedNodes.map(n => {
            const currentPosition = nodePositions.get(n.id);
            return {
                ...n,
                x: currentPosition?.x ?? n.x,
                y: currentPosition?.y ?? n.y,
            };
        });

        const SIDES: SocketSide[] = ['top', 'right', 'bottom', 'left'];
        const MAX_SOCKETS_FOR_EXHAUSTIVE_SEARCH = 7; 
        const NUM_ITERATIONS = 3;
    
        const nodeMap = new Map<string, GraphNode>(updatedNodes.map(n => [n.id, n]));
        const getSocketKey = (nodeId: string, type: 'input' | 'output', label: string) => `${nodeId}::${type}::${label}`;
    
        const nodeSockets = new Map<string, SocketInfo[]>();
        updatedNodes.forEach(node => {
            const sockets: SocketInfo[] = [
                ...(node.inputs || []).map(label => ({ label, type: 'input' as const })),
                ...(node.outputs || []).map(label => ({ label, type: 'output' as const }))
            ];
            nodeSockets.set(node.id, sockets);
        });
    
        const linksBySocket = new Map<string, any[]>();
        validLinks.forEach(link => {
            const sourceId = getLinkEndpointId(link.source), targetId = getLinkEndpointId(link.target);
            if (!sourceId || !targetId) return;
            [
                { id: sourceId, type: 'output' as const, label: link.sourceLabel },
                { id: targetId, type: 'input' as const, label: link.targetLabel }
            ].forEach(s => {
                const key = getSocketKey(s.id, s.type, s.label);
                if (!linksBySocket.has(key)) linksBySocket.set(key, []);
                linksBySocket.get(key)!.push(link);
            });
        });
    
        const getSocketWorldPos = (node: GraphNode, side: SocketSide, index: number, count: number): { x: number; y: number } => {
            const nodePos = { x: node.x ?? 0, y: node.y ?? 0 };
            const halfWidth = NODE_WIDTH / 2, halfHeight = NODE_HEIGHT / 2;
            const totalWidth = NODE_WIDTH * 0.8, totalHeight = NODE_HEIGHT * 0.8;
            const startOffset = (total: number) => -total / 2;
            const spacing = (total: number, num: number) => num > 1 ? total / (num - 1) : 0;
            let offset;
            switch (side) {
                case 'top': case 'bottom':
                    offset = count > 0 ? startOffset(totalWidth) + index * spacing(totalWidth, count) : 0;
                    return { x: nodePos.x + offset, y: nodePos.y + (side === 'top' ? -halfHeight : halfHeight) };
                case 'left': case 'right':
                    offset = count > 0 ? startOffset(totalHeight) + index * spacing(totalHeight, count) : 0;
                    return { x: nodePos.x + (side === 'left' ? -halfWidth : halfWidth), y: nodePos.y + offset };
            }
        };
    
        const distanceSq = (p1: { x: number, y: number }, p2: { x: number, y: number }) => Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    
        let currentAssignments = new Map<string, SocketSide>();
        updatedNodes.forEach(node => {
            (node.inputs || []).forEach(label => currentAssignments.set(getSocketKey(node.id, 'input', label), 'left'));
            (node.outputs || []).forEach(label => currentAssignments.set(getSocketKey(node.id, 'output', label), 'right'));
        });
    
        for (let i = 0; i < NUM_ITERATIONS; i++) {
            updatedNodes.forEach(node => {
                const sockets = nodeSockets.get(node.id) || [];
                if (sockets.length === 0 || sockets.length > MAX_SOCKETS_FOR_EXHAUSTIVE_SEARCH) return;
    
                const connectedSocketPositions = new Map<string, { x: number, y: number }>();
                sockets.forEach(socket => {
                    const links = linksBySocket.get(getSocketKey(node.id, socket.type, socket.label)) || [];
                    links.forEach(link => {
                        const isSource = getLinkEndpointId(link.source) === node.id;
                        const other = {
                            nodeId: isSource ? getLinkEndpointId(link.target) : getLinkEndpointId(link.source),
                            socketLabel: isSource ? link.targetLabel : link.sourceLabel,
                            socketType: isSource ? 'input' as const : 'output' as const
                        };
                        if (!other.nodeId || !other.socketLabel) return;
                        const otherNode = nodeMap.get(other.nodeId);
                        if (!otherNode) return;
    
                        const otherSocketKey = getSocketKey(other.nodeId, other.socketType, other.socketLabel);
                        const otherSide = currentAssignments.get(otherSocketKey)!;
                        const socketsOnOtherSide = (nodeSockets.get(other.nodeId) || []).filter(s => currentAssignments.get(getSocketKey(other.nodeId, s.type, s.label)) === otherSide);
                        const indexOnSide = socketsOnOtherSide.findIndex(s => s.label === other.socketLabel && s.type === other.socketType);
                        if (indexOnSide !== -1) {
                            connectedSocketPositions.set(otherSocketKey, getSocketWorldPos(otherNode, otherSide, indexOnSide, socketsOnOtherSide.length));
                        }
                    });
                });
    
                let minCost = Infinity;
                let bestArrangement: SocketSide[] | null = null;
                const numArrangements = Math.pow(4, sockets.length);
    
                for (let j = 0; j < numArrangements; j++) {
                    let temp = j, currentCost = 0;
                    const arrangement: SocketSide[] = [];
                    for (let k = 0; k < sockets.length; k++) {
                        arrangement.push(SIDES[temp % 4]);
                        temp = Math.floor(temp / 4);
                    }
    
                    const socketsBySideInArrangement: { [key in SocketSide]: SocketInfo[] } = { top: [], right: [], bottom: [], left: [] };
                    sockets.forEach((socket, k) => socketsBySideInArrangement[arrangement[k]].push(socket));
    
                    const nodePos = nodePositions.get(node.id);
                    if (nodePos) {
                        SIDES.forEach(side => {
                            socketsBySideInArrangement[side].sort((a, b) => {
                                const getAngle = (socket: SocketInfo) => {
                                    let totalX = 0, totalY = 0, count = 0;
                                    const links = linksBySocket.get(getSocketKey(node.id, socket.type, socket.label)) || [];
                                    links.forEach(link => {
                                        const isSource = getLinkEndpointId(link.source) === node.id;
                                        const otherNodeId = isSource ? getLinkEndpointId(link.target) : getLinkEndpointId(link.source);
                                        const otherNodePos = nodePositions.get(otherNodeId!);
                                        if (otherNodePos) { totalX += otherNodePos.x; totalY += otherNodePos.y; count++; }
                                    });
                                    if (count === 0) return socket.type === 'input' ? Math.PI : 0;
                                    return Math.atan2((totalY / count) - nodePos.y, (totalX / count) - nodePos.x);
                                };
                                return getAngle(a) - getAngle(b);
                            });
                        });
                    }
    
                    const arrangementSocketPositions = new Map<string, { x: number; y: number }>();
                    SIDES.forEach(side => {
                        const sortedSocketsOnSide = socketsBySideInArrangement[side];
                        sortedSocketsOnSide.forEach((socket, index) => {
                            const pos = getSocketWorldPos(node, side, index, sortedSocketsOnSide.length);
                            arrangementSocketPositions.set(getSocketKey(node.id, socket.type, socket.label), pos);
                        });
                    });
    
                    sockets.forEach(socket => {
                        const socketKey = getSocketKey(node.id, socket.type, socket.label);
                        const links = linksBySocket.get(socketKey) || [];
                        const pos1 = arrangementSocketPositions.get(socketKey)!;
                        links.forEach(link => {
                            const isSource = getLinkEndpointId(link.source) === node.id;
                            const other = { nodeId: isSource ? getLinkEndpointId(link.target) : getLinkEndpointId(link.source), label: isSource ? link.targetLabel : link.sourceLabel, type: isSource ? 'input' as const : 'output' as const };
                            if (!other.nodeId || !other.label) return;
                            const otherKey = getSocketKey(other.nodeId, other.type, other.label);
                            const pos2 = connectedSocketPositions.get(otherKey);
                            if (pos1 && pos2) currentCost += distanceSq(pos1, pos2);
                        });
                    });
    
                    if (currentCost < minCost) {
                        minCost = currentCost;
                        bestArrangement = arrangement;
                    }
                }
    
                if (bestArrangement) {
                    sockets.forEach((socket, index) => currentAssignments.set(getSocketKey(node.id, socket.type, socket.label), bestArrangement![index]));
                }
            });
        }
    
        const finalRenderableSockets = new Map<string, { [key in SocketSide]: SocketInfo[] }>();
        const finalPositionLayout = new Map<string, { inputs: Map<string, SocketPosition>; outputs: Map<string, SocketPosition> }>();
    
        updatedNodes.forEach(node => {
            const groups: { [key in SocketSide]: SocketInfo[] } = { top: [], right: [], bottom: [], left: [] };
            (nodeSockets.get(node.id) || []).forEach(socket => {
                const key = getSocketKey(node.id, socket.type, socket.label);
                const side = currentAssignments.get(key) || (socket.type === 'input' ? 'left' : 'right');
                groups[side].push(socket);
            });
    
            const nodePos = nodePositions.get(node.id);
            if (nodePos) {
                SIDES.forEach(side => {
                    groups[side].sort((a, b) => {
                        const getAngle = (socket: SocketInfo) => {
                            let totalX = 0, totalY = 0, count = 0;
                            const links = linksBySocket.get(getSocketKey(node.id, socket.type, socket.label)) || [];
                            links.forEach(link => {
                                const isSource = getLinkEndpointId(link.source) === node.id;
                                const otherNodeId = isSource ? getLinkEndpointId(link.target) : getLinkEndpointId(link.source);
                                const otherNodePos = nodePositions.get(otherNodeId!);
                                if (otherNodePos) { totalX += otherNodePos.x; totalY += otherNodePos.y; count++; }
                            });
                            if (count === 0) return socket.type === 'input' ? Math.PI : 0;
                            return Math.atan2((totalY / count) - nodePos.y, (totalX / count) - nodePos.x);
                        };
                        return getAngle(a) - getAngle(b);
                    });
                });
            }
            finalRenderableSockets.set(node.id, groups);
    
            const layout: { inputs: Map<string, SocketPosition>; outputs: Map<string, SocketPosition> } = { inputs: new Map(), outputs: new Map() };
            SIDES.forEach(side => {
                const sockets = groups[side];
                const len = sockets.length;
                if (len === 0) return;
                const positionsMap: Record<SocketSide, SocketPosition[]> = {
                    top: ['top-left', 'top', 'top-right'], right: ['top-right', 'right', 'bottom-right'],
                    bottom: ['bottom-left', 'bottom', 'bottom-right'], left: ['top-left', 'left', 'bottom-left']
                };
                const positions = positionsMap[side];
                sockets.forEach((socket, i) => {
                    let pos: SocketPosition = positions[1];
                    if (len > 1) {
                        if (i === 0) pos = positions[0];
                        else if (i === len - 1) pos = positions[2];
                    }
                    layout[`${socket.type}s` as 'inputs' | 'outputs'].set(socket.label, pos);
                });
            });
            finalPositionLayout.set(node.id, layout);
        });
    
        return { socketPositionLayout: finalPositionLayout, renderableSockets: finalRenderableSockets };
    }, [memoizedNodes, validLinks, nodePositions, getLinkEndpointId]);


    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const { clientX, clientY, deltaY } = e;
        const zoomFactor = Math.pow(0.995, deltaY);
        
        setViewTransform(prevTransform => {
            const newK = Math.max(0.2, Math.min(4, prevTransform.k * zoomFactor));

            if (!containerRef.current) return prevTransform;
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            return {
                x: mouseX - (mouseX - prevTransform.x) * (newK / prevTransform.k),
                y: mouseY - (mouseY - prevTransform.y) * (newK / prevTransform.k),
                k: newK
            };
        });
    }, []);
    
    const stateRef = useRef({
        nodes: memoizedNodes, links: memoizedLinks, onSelectEntry, onNodePositionChange, onNodeContentChange, onBackgroundClick, onAddRelationshipDirectly, onAddSocketAndConnect, onToggleRelationshipInlined, occupiedInputSockets, viewTransform,
        draggedNode, newConnection, inlineEditingSocket,
        setDraggedNode, setNewConnection, setViewTransform
    });
    useLayoutEffect(() => {
        stateRef.current = {
            nodes: memoizedNodes, links: memoizedLinks, onSelectEntry, onNodePositionChange, onNodeContentChange, onBackgroundClick, onAddRelationshipDirectly, onAddSocketAndConnect, onToggleRelationshipInlined, occupiedInputSockets, viewTransform,
            draggedNode, newConnection, inlineEditingSocket,
            setDraggedNode, setNewConnection, setViewTransform
        };
    });

    const interactionStateRef = useRef({
        mode: 'idle' as 'idle' | 'panning' | 'draggingNode' | 'connecting',
        hasDragged: false,
        startX: 0,
        startY: 0,
        initialTransformX: 0,
        initialTransformY: 0,
        draggedNodeOriginalPosition: { x: 0, y: 0 },
    });


    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const screenToWorld = (clientX: number, clientY: number) => {
            if (!containerRef.current) return { x: 0, y: 0 };
            const rect = containerRef.current.getBoundingClientRect();
            const { x: viewX, y: viewY, k: viewK } = stateRef.current.viewTransform;
            return {
                x: (clientX - rect.left - viewX) / viewK,
                y: (clientY - rect.top - viewY) / viewK,
            };
        };

        const handleMouseMove = (e: MouseEvent) => {
            const interactionState = interactionStateRef.current;
            if (interactionState.mode === 'idle') return;

            if (!interactionState.hasDragged) {
                const dx = e.clientX - interactionState.startX;
                const dy = e.clientY - interactionState.startY;
                if (Math.sqrt(dx * dx + dy * dy) > 5) interactionState.hasDragged = true;
            }

            if (interactionState.mode === 'draggingNode') {
                const { draggedNode: currentDraggedNode, setDraggedNode } = stateRef.current;
                if (!currentDraggedNode) return;
                const { x, y } = screenToWorld(e.clientX, e.clientY);
                setDraggedNode({ ...currentDraggedNode, x: x - currentDraggedNode.offsetX, y: y - currentDraggedNode.offsetY });
            }

            if (interactionState.mode === 'connecting') {
                const { setNewConnection } = stateRef.current;
                const worldPos = screenToWorld(e.clientX, e.clientY);
                setNewConnection(c => c ? { ...c, endX: worldPos.x, endY: worldPos.y } : null);
            }

            if (interactionState.mode === 'panning' && interactionState.hasDragged) {
                const { setViewTransform } = stateRef.current;
                const dx = e.clientX - interactionState.startX;
                const dy = e.clientY - interactionState.startY;
                setViewTransform(prev => ({ ...prev, x: interactionState.initialTransformX + dx, y: interactionState.initialTransformY + dy }));
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            const interactionState = interactionStateRef.current;
            const { draggedNode: currentDraggedNode, newConnection: currentNewConnection, setDraggedNode, setNewConnection } = stateRef.current;
            const { onSelectEntry, onNodePositionChange, onAddRelationshipDirectly, onAddSocketAndConnect, onBackgroundClick, onToggleRelationshipInlined, links, occupiedInputSockets, nodes } = stateRef.current;

            if (interactionState.mode === 'draggingNode' && currentDraggedNode) {
                const originalNode = nodes.find(n => n.id === currentDraggedNode.id);
                if (originalNode) {
                    if (interactionState.hasDragged) {
                        onNodePositionChange(originalNode, { x: currentDraggedNode.x, y: currentDraggedNode.y });
                    } else {
                        // CLICK LOGIC
                        const target = e.target as Element;
                        if (target.closest('.raw-input-field')) {
                            (target as HTMLInputElement).focus();
                        } else if (!target.closest('.entry-node--output-raw')) { 
                            onSelectEntry(originalNode.bookId, originalNode.povId, originalNode.id);
                        }
                        // For raw output, do nothing on click
                    }
                }
            }

            if (interactionState.mode === 'connecting' && currentNewConnection) {
                const targetEl = document.elementFromPoint(e.clientX, e.clientY);
                const dropSocketTarget = targetEl?.closest('[data-socket-type]');
                
                if (dropSocketTarget) {
                    const dropType = dropSocketTarget.getAttribute('data-socket-type');
                    const targetNodeId = dropSocketTarget.getAttribute('data-node-id');
                    const targetSocketLabel = dropSocketTarget.getAttribute('data-socket-label');

                    if (targetNodeId && targetSocketLabel && currentNewConnection.sourceNodeId !== targetNodeId) {
                        const dragFromOutput = currentNewConnection.dragFrom === 'output' && dropType === 'input';
                        const dragFromInput = currentNewConnection.dragFrom === 'input' && dropType === 'output';

                        const sourceEntryId = dragFromOutput ? currentNewConnection.sourceNodeId : targetNodeId!;
                        const targetEntryId = dragFromOutput ? targetNodeId! : currentNewConnection.sourceNodeId;
                        const sourceLabel = dragFromOutput ? currentNewConnection.sourceSocketLabel : targetSocketLabel!;
                        const targetLabel = dragFromOutput ? targetSocketLabel! : currentNewConnection.sourceSocketLabel;
                        
                        const getLinkEndpointId = (endpoint: any): string | null => {
                            if (typeof endpoint === 'string') return endpoint;
                            if (typeof endpoint === 'object' && endpoint !== null && typeof endpoint.id === 'string') return endpoint.id;
                            return null;
                        };
                        const existingLink = links.find(link => 
                            getLinkEndpointId(link.source) === sourceEntryId &&
                            getLinkEndpointId(link.target) === targetEntryId &&
                            link.sourceLabel === sourceLabel &&
                            link.targetLabel === targetLabel
                        );

                        if (existingLink) {
                            const sourceNode = nodes.find(n => n.id === sourceEntryId);
                            const targetNode = nodes.find(n => n.id === targetEntryId);
                            if (sourceNode && targetNode) {
                                if (sourceNode.type === 'input' && !existingLink.isInlined) {
                                    onToggleRelationshipInlined(existingLink.id, sourceNode.bookId, targetNode, true);
                                } else if (targetNode.type === 'output' && !existingLink.isInlined) {
                                    onToggleRelationshipInlined(existingLink.id, targetNode.bookId, sourceNode, true);
                                }
                            }
                        } else if (dragFromOutput || dragFromInput) {
                            if (dragFromOutput && occupiedInputSockets.has(`${targetNodeId}::${targetSocketLabel}`)) return;
            
                            const sourceNode = nodes.find(n => n.id === sourceEntryId);
                            if (sourceNode) {
                                onAddRelationshipDirectly({
                                    sourceEntryId,
                                    targetEntryId,
                                    sourceLabel,
                                    targetLabel,
                                    bookId: sourceNode.bookId
                                });
                            }
                        }
                    }
                } else {
                    const dropVisualsTarget = targetEl?.closest('.entry-node-visuals');

                    if (dropVisualsTarget) {
                        const dropNodeTarget = dropVisualsTarget.closest('.entry-node');
                        const targetNodeId = dropNodeTarget?.getAttribute('data-id');

                        if (targetNodeId && targetNodeId !== currentNewConnection.sourceNodeId) {
                            const targetNode = nodes.find(n => n.id === targetNodeId);
                            if (!targetNode) return;
    
                            const newSocketType = currentNewConnection.dragFrom === 'output' ? 'input' : 'output';
                            
                            // Automatically generate a new socket name
                            let newSocketName;
                            let counter = 1;
                            const prefix = newSocketType === 'input' ? 'Input' : 'Output';
                            const existingSockets = (newSocketType === 'input' ? targetNode.inputs : targetNode.outputs) || [];
                            do {
                                newSocketName = `${prefix} ${counter}`;
                                counter++;
                            } while (existingSockets.includes(newSocketName));
                            
                            const trimmedName = newSocketName;
                            
                            const sourceEntryId = currentNewConnection.dragFrom === 'output' ? currentNewConnection.sourceNodeId : targetNodeId;
                            const sourceSocketLabel = currentNewConnection.dragFrom === 'output' ? currentNewConnection.sourceSocketLabel : trimmedName;
                            const targetSocketLabel = currentNewConnection.dragFrom === 'output' ? trimmedName : currentNewConnection.sourceSocketLabel;
                            
                            const sourceNode = nodes.find(n => n.id === sourceEntryId);
                            if (sourceNode && sourceNode.bookId !== targetNode.bookId) {
                                alert("Relationships can only be created between entries in the same book.");
                            } else {
                                onAddSocketAndConnect({
                                    targetNode: targetNode,
                                    newSocketType: newSocketType,
                                    newSocketLabel: trimmedName,
                                    sourceEntryId: sourceEntryId,
                                    sourceSocketLabel: sourceSocketLabel,
                                    targetSocketLabel: targetSocketLabel,
                                });
                            }
                        }
                    }
                }
            }
            
            if (interactionState.mode === 'panning' && !interactionState.hasDragged) {
                const { x, y } = screenToWorld(e.clientX, e.clientY);
                onBackgroundClick({ x, y });
            }

            interactionState.mode = 'idle';
            interactionState.hasDragged = false;
            setDraggedNode(null);
            setNewConnection(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target;
            if (!(target instanceof Element)) return;

            if (target.closest('.socket-label') || target.closest('.node-content-input') || target.closest('.socket-inlined-input')) {
                return;
            }

            if (stateRef.current.inlineEditingSocket) {
                return;
            }

            const interactionState = interactionStateRef.current;
            
            if (target.closest('.generate-ideas-button, .refresh-button, .delete-entry-node-button, .add-input-socket-button, .add-output-socket-button, .socket-eject-button')) {
                return;
            }

            const socketTarget = target.closest('[data-socket-type]');
            const nodeTarget = target.closest('.entry-node-visuals, .entry-node--input-raw, .entry-node--output-raw');

            interactionState.startX = e.clientX;
            interactionState.startY = e.clientY;
            
            if (socketTarget) {
                const type = socketTarget.getAttribute('data-socket-type') as 'input' | 'output';
                const positionAttr = socketTarget.getAttribute('data-socket-position');
                const sideAttr = socketTarget.getAttribute('data-socket-side');
                const nodeId = socketTarget.getAttribute('data-node-id');
                const label = socketTarget.getAttribute('data-socket-label');
        
                if (!type || !nodeId || !label || !isSocketPosition(positionAttr) || !isSocketSide(sideAttr)) {
                    console.warn('Socket element is missing required data attributes or has an invalid position.', { socketTarget });
                    return;
                }
                const position = positionAttr;
                const side = sideAttr;

                if (type === 'input' && stateRef.current.occupiedInputSockets.has(`${nodeId}::${label}`)) {
                    const node = stateRef.current.nodes.find(n => n.id === nodeId);
                    // Allow dragging from an occupied input ONLY if it's on an 'output' node (for re-docking)
                    if (node && node.type !== 'output') {
                        return;
                    }
                }

                e.stopPropagation();
                interactionState.mode = 'connecting';
                
                const handleEl = socketTarget.querySelector('.socket-handle');
                if (handleEl) {
                    const rect = handleEl.getBoundingClientRect();
                    const sourceScreenPosX = rect.left + rect.width / 2;
                    const sourceScreenPosY = rect.top + rect.height / 2;

                    const sourceWorldPos = screenToWorld(sourceScreenPosX, sourceScreenPosY);

                    stateRef.current.setNewConnection({
                        sourceNodeId: nodeId, 
                        sourceSocketLabel: label,
                        sourceX: sourceWorldPos.x, sourceY: sourceWorldPos.y,
                        endX: sourceWorldPos.x, endY: sourceWorldPos.y,
                        dragFrom: type,
                        sourcePosition: position,
                        sourceSide: side,
                    });
                }
                
            } else if (nodeTarget) {
                e.preventDefault();
                e.stopPropagation();
                interactionState.mode = 'draggingNode';
                const nodeId = nodeTarget.closest('.entry-node')?.getAttribute('data-id')!;
                const { nodes, setDraggedNode } = stateRef.current;
                const node = nodes.find(n => n.id === nodeId);
                if (!node) return;

                const worldPos = screenToWorld(e.clientX, e.clientY);
                const nodeX = node.x ?? 0;
                const nodeY = node.y ?? 0;
                
                setDraggedNode({ id: nodeId, x: nodeX, y: nodeY, offsetX: worldPos.x - nodeX, offsetY: worldPos.y - nodeY });
                interactionState.draggedNodeOriginalPosition = { x: nodeX, y: nodeY };

            } else {
                interactionState.mode = 'panning';
                const { x, y } = stateRef.current.viewTransform;
                interactionState.initialTransformX = x;
                interactionState.initialTransformY = y;
            }
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
            const interactionState = interactionStateRef.current;
            if (e.key === 'Escape') {
                const { setDraggedNode, setNewConnection, onNodePositionChange, nodes } = stateRef.current;
                if (interactionState.mode === 'draggingNode' && stateRef.current.draggedNode) {
                     const node = nodes.find(n => n.id === stateRef.current.draggedNode?.id);
                     if (node) onNodePositionChange(node, interactionState.draggedNodeOriginalPosition);
                }
                setDraggedNode(null);
                setNewConnection(null);
                interactionState.mode = 'idle';
            }
        };

        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []); 

    const [connectionInfo, setConnectionInfo] = useState<Map<string, { pathD: string; arrows: { x: number; y: number; angle: number; }[] }>>(new Map());

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const newInfo = new Map<string, { pathD: string; arrows: { x: number; y: number; angle: number; }[] }>();
        const viewRect = containerRef.current.getBoundingClientRect();

        validLinks.forEach(link => {
            if (link.isInlined) return; // Don't draw inlined links
            const sourceId = getLinkEndpointId(link.source);
            const targetId = getLinkEndpointId(link.target);
            if (!sourceId || !targetId || !link.sourceLabel || !link.targetLabel) return;
            
            const sourceSocketEl = containerRef.current?.querySelector(`[data-socket-id="${sourceId}::output::${link.sourceLabel}"]`);
            const targetSocketEl = containerRef.current?.querySelector(`[data-socket-id="${targetId}::input::${link.targetLabel}"]`);
            
            if (sourceSocketEl && targetSocketEl) {
                const sourceHandle = sourceSocketEl.querySelector('.socket-handle');
                const targetHandle = targetSocketEl.querySelector('.socket-handle');
                const sourcePositionAttr = sourceSocketEl.getAttribute('data-socket-position');
                const targetPositionAttr = targetSocketEl.getAttribute('data-socket-position');
                const sourceSideAttr = sourceSocketEl.getAttribute('data-socket-side');
                const targetSideAttr = targetSocketEl.getAttribute('data-socket-side');

                if (sourceHandle && targetHandle && isSocketPosition(sourcePositionAttr) && isSocketPosition(targetPositionAttr) && isSocketSide(sourceSideAttr) && isSocketSide(targetSideAttr)) {
                    const sourceRect = sourceHandle.getBoundingClientRect();
                    const targetRect = targetHandle.getBoundingClientRect();
                    const { pathD, arrows } = getConnectionPoints(sourceRect, sourcePositionAttr, sourceSideAttr, targetRect, targetPositionAttr, targetSideAttr, viewRect, viewTransform);
                    newInfo.set(link.id, { pathD, arrows });
                }
            }
        });
        setConnectionInfo(newInfo);
    }, [validLinks, getLinkEndpointId, finalNodes, viewTransform, socketPositionLayout]);
    
    const commitOrCancelEdit = () => {
        if (!inlineEditingSocket) return;

        const { nodeId, type, label: oldLabel, currentValue } = inlineEditingSocket;
        const node = memoizedNodes.find(n => n.id === nodeId);

        if (node) {
            onUpdateSocketLabel(node, type, oldLabel, currentValue);
        }

        setInlineEditingSocket(null);
    };

    const cancelEdit = () => {
        if (!inlineEditingSocket) return;
        const { nodeId, type, label: oldLabel } = inlineEditingSocket;
        const node = memoizedNodes.find(n => n.id === nodeId);
        if (node) {
            onUpdateSocketLabel(node, type, oldLabel, ''); // Pass empty string to delete
        }
        setInlineEditingSocket(null);
    };

    const handleKeyDownOnSocketInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            cancelEdit();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            commitOrCancelEdit();
        }
    };
    
    const handleSocketInputBlur = () => {
        if (ignoreNextBlur.current) {
            ignoreNextBlur.current = false;
            return;
        }
        commitOrCancelEdit();
    };

    if (memoizedNodes.length === 0) {
        return (
             <div 
                className="graph-view-container graph-view-empty" 
                ref={containerRef} 
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const worldX = (e.clientX - rect.left - viewTransform.x) / viewTransform.k;
                    const worldY = (e.clientY - rect.top - viewTransform.y) / viewTransform.k;
                    onBackgroundClick({ x: worldX, y: worldY });
                }}
            >
                <p className="graph-view-placeholder">The graph is empty. Click anywhere on the background to add your first entry.</p>
            </div>
        );
    }
    
    return (
        <div className="graph-view-container" ref={containerRef} onWheel={handleWheel}>
            <div className="graph-content-wrapper" style={{ transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.k})`, transformOrigin: '0 0' }}>
                <svg className="graph-svg-layer">
                    <defs>
                        <path
                            id="arrowhead-path"
                            d="M -10 -7 L 0 0 L -10 7"
                            fill="none"
                            stroke="#1877f2"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </defs>
                    <g>
                        {Array.from(connectionInfo.entries()).map(([linkId, info]) => {
                            const link = validLinks.find(l => l.id === linkId);
                            if (!link || !info) return null;
                            const { pathD, arrows } = info;
                            return (
                                <g key={link.id} className="relationship-group" onClick={() => onEditRelationship(link)}>
                                    <path d={pathD} className="relationship-hitbox" />
                                    <path d={pathD} className="relationship-line" />
                                    {arrows.map((arrow, index) => (
                                        <use 
                                            key={index}
                                            href="#arrowhead-path"
                                            transform={`translate(${arrow.x}, ${arrow.y}) rotate(${arrow.angle})`}
                                        />
                                    ))}
                                </g>
                            );
                        })}
                    </g>
                    {newConnection && (() => {
                        const { sourceX, sourceY, endX, endY, sourceSide } = newConnection;
                        const dx = endX - sourceX;
                        const dy = endY - sourceY;
                        
                        // Use the same large handle size as the final render for consistency.
                        const handleSize = 120;
                        
                        let c1x = sourceX;
                        let c1y = sourceY;

                        // Explicitly calculate source control point based on side
                        switch (sourceSide) {
                            case 'top':    c1y -= handleSize; break;
                            case 'bottom': c1y += handleSize; break;
                            case 'left':   c1x -= handleSize; break;
                            case 'right':  c1x += handleSize; break;
                        }
                        
                        // Pull the second control point back from the cursor for a smoother preview.
                        const c2x = endX - dx * 0.25;
                        const c2y = endY - dy * 0.25;
                        
                        const pathD = `M${sourceX},${sourceY} C${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
                        
                        return ( <path className="new-connection-line" d={pathD} /> );
                    })()}
                </svg>

                <div className="graph-nodes-layer">
                    {finalNodes.map((node) => {
                        const nodeSockets = renderableSockets.get(node.id);
                        if (!nodeSockets) return null;
                        
                        const layout = socketPositionLayout.get(node.id);
                        if(!layout) return null;
                        
                        return (
                            <EntryNode
                                key={node.id}
                                node={node}
                                renderableSocketsForNode={nodeSockets}
                                socketPositionLayoutForNode={layout}
                                occupiedInputSockets={occupiedInputSockets}
                                newConnection={newConnection}
                                inlineEditingSocket={inlineEditingSocket}
                                onDeleteEntry={onDeleteEntry}
                                onGenerateIdeas={onGenerateIdeas}
                                onRecomputeCode={onRecomputeCode}
                                onRecomputeNL={onRecomputeNL}
                                onNodeContentChange={onNodeContentChange}
                                onAddSocket={onAddSocket}
                                setInlineEditingSocket={setInlineEditingSocket}
                                handleKeyDownOnSocketInput={handleKeyDownOnSocketInput}
                                handleSocketInputBlur={handleSocketInputBlur}
                                ignoreNextBlur={ignoreNextBlur}
                                inlinedInputValues={inlinedInputValues}
                                inlinedOutputValues={inlinedOutputValues}
                                onUpdateInlinedValue={onUpdateInlinedValue}
                                onToggleRelationshipInlined={onToggleRelationshipInlined}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default GraphView;