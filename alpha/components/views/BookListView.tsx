/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * A view component that renders the list of books. Each book is displayed as a card
 * with its title and a count of its Points of View.
 */

import React from 'react';
import { Books, Book } from '../../types/types.ts';

interface BookListViewProps {
    books: Books | null;
    onSelectBook: (bookId: string) => void;
    onDeleteBook: (bookId: string, bookName: string) => void;
}

const BookListView: React.FC<BookListViewProps> = ({ books, onSelectBook, onDeleteBook }) => {
    if (!books) return null;

    return (
        <div className="book-list-container">
            {Object.entries(books).map(([bookId, book]: [string, Book]) => {
                const povCount = Object.keys(book.povs || {}).length;
                const isConflicted = book.conflicts && Object.keys(book.conflicts).length > 0;
                return (
                    <div key={bookId} className={`book-card ${isConflicted ? 'conflicted' : ''}`}>
                        <div className="card-main-content" onClick={() => onSelectBook(bookId)} tabIndex={0}>
                            <h2 className="book-card-title">{book.title || 'Untitled Book'}</h2>
                            <p className="book-card-preview">
                                {povCount} {povCount === 1 ? 'Point of View' : 'Points of View'}
                            </p>
                        </div>
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                onDeleteBook(bookId, book.title || 'Untitled Book');
                            }} 
                            className="delete-book-button" 
                            aria-label={`Delete book: ${book.title || 'Untitled Book'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default BookListView;