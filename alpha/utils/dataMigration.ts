/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Contains data migration logic for updating the application's data structure
 * to the latest schema. This ensures backward compatibility with older data formats
 * that may be stored locally or in the cloud.
 */

import { Books, Entry } from '../types/types.ts';

/**
 * Migrates a 'books' data object through various legacy schemas to the current one.
 * This function handles multiple migration paths:
 * - from a flat content string to a versioned structure.
 * - from a POV-level version list to a nested, entry-level version list.
 * - adds missing 'title' properties to versions.
 * @param books The books data object to migrate.
 * @returns An object containing the migrated data and a boolean indicating if a migration occurred.
 */
export const migrateBooksData = (books: Books): {migratedBooks: Books, wasMigrated: boolean} => {
    let wasMigrated = false;
    const migratedBooks = JSON.parse(JSON.stringify(books));

    Object.values(migratedBooks).forEach((book: any) => {
        if (!book.povs) book.povs = {};

        // Add relationships array if it doesn't exist
        if (!book.relationships) {
            book.relationships = [];
            wasMigrated = true;
        } else {
            // Migration for relationships from single `label` to `sourceLabel` and `targetLabel`
            book.relationships.forEach((rel: any) => {
                if (rel.hasOwnProperty('label') && !rel.hasOwnProperty('sourceLabel')) {
                    wasMigrated = true;
                    rel.targetLabel = rel.label;
                    rel.sourceLabel = '';
                    delete rel.label;
                }
            });
        }
        
        // Add conflicts object if it doesn't exist
        if (!book.conflicts) {
            book.conflicts = {};
            wasMigrated = true;
        }

        Object.values(book.povs).forEach((pov: any) => {
            // Migration from content -> versions (very old)
            if (pov.hasOwnProperty('content') && !pov.hasOwnProperty('versions')) {
                wasMigrated = true;
                const timestamp = Date.now();
                const versionId = `v-${timestamp}-${Math.random()}`;
                pov.versions = {
                    [versionId]: {
                        id: versionId,
                        timestamp: timestamp,
                        content: pov.content,
                        name: `Version from ${new Date(timestamp).toLocaleString()}`,
                    },
                };
                pov.activeVersionId = versionId;
                delete pov.content;
            }

            // Migration from versions -> entries (current)
            if (pov.hasOwnProperty('versions') && !pov.hasOwnProperty('entries')) {
                wasMigrated = true;
                const entryId = `entry-${Date.now()}-${Math.random()}`;
                const newEntry: Entry = {
                    id: entryId,
                    versions: pov.versions,
                    activeVersionId: pov.activeVersionId,
                    type: 'prose',
                    inputs: [],
                    outputs: [],
                };

                // Add title to each version
                Object.values(newEntry.versions).forEach((version: any) => {
                    if (!version.hasOwnProperty('title')) {
                        version.title = pov.title;
                    }
                });

                pov.entries = { [entryId]: newEntry };
                delete pov.versions;
                delete pov.activeVersionId;
            } else if (pov.hasOwnProperty('entries')) {
                 // Check if versions inside entries need title migration and socket data structure
                 Object.values(pov.entries).forEach((entry: any) => {
                     Object.values(entry.versions).forEach((version: any) => {
                         if (!version.hasOwnProperty('title')) {
                             wasMigrated = true;
                             version.title = pov.title; // Fallback to POV title
                         }
                     });
                     
                     // Handle type migrations
                     if (!entry.hasOwnProperty('type')) {
                        wasMigrated = true;
                        entry.type = 'prose';
                     } else {
                        switch(entry.type) {
                            case 'code':
                            case 'js-code':
                                wasMigrated = true;
                                entry.type = 'js';
                                break;
                            case 'narrative':
                                wasMigrated = true;
                                entry.type = 'prose';
                                break;
                            case 'nl-code':
                                wasMigrated = true;
                                entry.type = 'nl';
                                break;
                        }
                     }
                     
                     // Add/correct sockets based on type
                     if (entry.type === 'input') {
                        // Enforce a single 'value' output, and no inputs.
                        const hasCorrectSockets = entry.outputs?.length === 1 && entry.outputs[0] === 'value' && (!entry.inputs || entry.inputs.length === 0);
                        if (!hasCorrectSockets) {
                            wasMigrated = true;
                            entry.outputs = ['value'];
                            entry.inputs = [];
                        }
                     } else if (entry.type === 'output') {
                        // Enforce a single 'value' input, and no outputs.
                        const hasCorrectSockets = entry.inputs?.length === 1 && entry.inputs[0] === 'value' && (!entry.outputs || entry.outputs.length === 0);
                        if (!hasCorrectSockets) {
                            wasMigrated = true;
                            entry.inputs = ['value'];
                            entry.outputs = [];
                        }
                     } else {
                         // Add inputs/outputs arrays if they don't exist
                         if (!entry.hasOwnProperty('inputs')) {
                             wasMigrated = true;
                             entry.inputs = [];
                         }
                         if (!entry.hasOwnProperty('outputs')) {
                             wasMigrated = true;
                             entry.outputs = [];
                         }
                     }
                     // Add dirty flag if it doesn't exist
                     if (!entry.hasOwnProperty('dirty')) {
                        wasMigrated = true;
                        entry.dirty = false;
                     }
                 });
            }
        });
    });

    return { migratedBooks, wasMigrated };
};