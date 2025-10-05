/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component for editing 'input' type entries.
 */

import React from 'react';

interface InputEntryProps {
    content: string;
    onTextChange: (newText: string) => void;
    disabled: boolean;
}

const InputEntry: React.FC<InputEntryProps> = ({ content, onTextChange, disabled }) => {
    return (
        <div className="input-entry-container">
            <h2>Input Value</h2>
            <input
                type="text"
                className="input-entry-value-input"
                value={content}
                onChange={(e) => onTextChange(e.target.value)}
                disabled={disabled}
                aria-label="Input Value"
            />
        </div>
    );
};

export default InputEntry;
