/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component for editing 'code' type entries. It provides a three-panel layout
 * for managing inputs, outputs, and the main code content.
 */

import React from 'react';

interface CodeEntryProps {
    content: string;
    onTextChange: (newText: string) => void;
    disabled: boolean;
}

const CodeEntry: React.FC<CodeEntryProps> = ({ content, onTextChange, disabled }) => {
    return (
        <div className="code-entry-container">
            <textarea
                className="code-entry-textarea"
                value={content}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter code here..."
                aria-label="Code Content"
            />
        </div>
    );
};

export default CodeEntry;