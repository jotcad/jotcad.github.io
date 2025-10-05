/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component for viewing 'output' type entries.
 */

import React from 'react';

interface OutputEntryProps {
    content: string;
}

const OutputEntry: React.FC<OutputEntryProps> = ({ content }) => {
    return (
        <div className="output-entry-container">
            <h2>Output Value</h2>
            <div className="output-entry-value-display">
                {content || '(Not computed)'}
            </div>
        </div>
    );
};

export default OutputEntry;
