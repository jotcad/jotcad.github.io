/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component for editing 'narrative' type entries. It provides a simple,
 * full-height textarea optimized for writing prose.
 */

import React from 'react';

interface NarrativeEntryProps {
    content: string;
    onTextChange: (newText: string) => void;
    disabled: boolean;
}

const NarrativeEntry: React.FC<NarrativeEntryProps> = ({ content, onTextChange, disabled }) => {
    return (
        <div className="narrative-entry-container">
            <textarea
                className="narrative-entry-textarea"
                value={content}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={disabled}
                placeholder="Start writing..."
                aria-label="Narrative Content"
            />
        </div>
    );
};

export default NarrativeEntry;
