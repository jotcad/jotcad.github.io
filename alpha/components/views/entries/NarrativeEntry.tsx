/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A component for editing 'narrative' type entries. It provides a simple,
 * full-height textarea optimized for writing prose.
 */

import React, { useRef, useEffect } from 'react';

interface NarrativeEntryProps {
    content: string;
    onTextChange: (newText: string) => void;
    disabled: boolean;
}

const NarrativeEntry: React.FC<NarrativeEntryProps> = ({ content, onTextChange, disabled }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastContent = useRef(content);

    useEffect(() => {
        if (contentRef.current && content !== contentRef.current.innerHTML) {
            contentRef.current.innerHTML = content;
            lastContent.current = content;
        }
    }, [content]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        if (newContent !== lastContent.current) {
            lastContent.current = newContent;
            onTextChange(newContent);
        }
    };

    return (
        <div className="narrative-entry-container">
            <div
                ref={contentRef}
                className="narrative-entry-textarea" // Re-use class for styling
                contentEditable={!disabled}
                onInput={handleInput}
                suppressContentEditableWarning={true}
                aria-label="Narrative Content"
                // Initial content is set by the useEffect hook
            />
        </div>
    );
};

export default NarrativeEntry;
