/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Centralized type definitions for the 'Author' application's data model.
 *
 * This file exports all interfaces and type aliases that describe the hierarchical data
 * structure (Books, POVs, Entries, Versions) as well as supporting types for features
 * like cloud synchronization and conflict resolution. Consolidating types here ensures
 * a single source of truth for the application's data shapes.
 */

// --- Main Data Structures ---

export interface Version {
    id: string;
    timestamp: number;
    content: string;
    name: string; // Version name, e.g., "Draft 1"
    title: string; // Entry title for this version
}

export interface Entry {
    id: string;
    versions: Record<string, Version>;
    activeVersionId: string;
    type?: 'prose' | 'js' | 'nl' | 'input' | 'output';
    x?: number; // Position for graph view
    y?: number; // Position for graph view
    inputs?: string[]; // Array of input socket labels
    outputs?: string[]; // Array of output socket labels
    dirty?: boolean; // Flag to indicate if dependencies have changed
}

export interface Pov {
  title: string; // e.g., "Character A"
  entries: Record<string, Entry>;
}

export interface Relationship {
  id: string;
  sourceEntryId: string;
  targetEntryId: string;
  sourceLabel: string;
  targetLabel: string;
  isInlined?: boolean;
}

export interface Book {
  title: string;
  povs: Record<string, Pov>;
  relationships?: Relationship[];
}

export type Books = Record<string, Book>; // Map of bookId -> Book


// --- Graph View Types ---

export interface GraphNode {
    id: string; // entry id
    title: string;
    povId: string;
    bookId: string;
    type?: 'prose' | 'js' | 'nl' | 'input' | 'output';
    content?: string;
    x?: number;
    y?: number;
    inputs?: string[];
    outputs?: string[];
    dirty?: boolean;
}


// --- Synchronization & Conflict Types ---

export interface VersionedData<T> {
  value: T;
  revisionId: string | null;
}

export interface BaseData<T> {
    books: T;
    revisionId: string | null;
}

export interface Conflict<T> {
    local: T;
    remote: T;
    remoteRevisionId: string | null;
}