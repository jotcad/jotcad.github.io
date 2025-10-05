/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A "dispatcher" component that selects the appropriate editor component based on the
 * entry's type (`narrative` or `code`). This allows for specialized UIs for different
 * kinds of content while keeping the main editor view clean.
 */

import React from 'react';
import { Entry } from '../types/types.ts';
import NarrativeEntry from './views/entries/NarrativeEntry.tsx';
import CodeEntry from './views/entries/CodeEntry.tsx';
import InputEntry from './views/entries/InputEntry.tsx';
import OutputEntry from './views/entries/OutputEntry.tsx';

interface EntryProps {
    entry: Entry;
    onTextChange: (newText: string) => void;
    disabled: boolean;
}

const EntryComponent: React.FC<EntryProps> = (props) => {
    const activeVersion = props.entry.versions[props.entry.activeVersionId];
    const content = activeVersion?.content ?? '';

    switch (props.entry.type) {
        case 'input':
            return (
                <InputEntry
                    content={content}
                    onTextChange={props.onTextChange}
                    disabled={props.disabled}
                />
            );
        case 'output':
             return (
                <OutputEntry
                    content={content}
                />
            );
        case 'js':
        case 'nl':
            return (
                <CodeEntry
                    content={content}
                    onTextChange={props.onTextChange}
                    disabled={props.disabled}
                />
            );
        case 'prose':
        default:
            return (
                <NarrativeEntry
                    content={content}
                    onTextChange={props.onTextChange}
                    disabled={props.disabled}
                />
            );
    }
};

export default EntryComponent;