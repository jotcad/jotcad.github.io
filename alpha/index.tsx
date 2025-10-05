/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Core application logic for 'Author', a hierarchical writing application.
 *
 * This refactored top-level component acts as a "controller" for the application. It is
 * responsible for managing all application state, data persistence, and cloud synchronization.
 * It orchestrates user authentication, handles local storage, and syncs data with Google Drive.
 * All UI rendering is delegated to specialized child components.
 *
 * Key Responsibilities:
 * - State Management: Uses React hooks to manage UI state, data objects (Books, POVs, Entries),
 *   and status flags (loading, saving, error, sync status).
 * - Business Logic: Contains all handler functions for user actions, data manipulation,
 *   and cloud synchronization.
 * - Data Persistence: Manages saving all data to IndexedDB via the IDBStore wrapper.
 * - Cloud Sync: Orchestrates synchronization with Google Drive, including conflict resolution.
 * - Authentication: Manages the Google Sign-In/Sign-Out flow.
 * - View Routing: Conditionally renders the appropriate view or modal component based on
 *   the current application state.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GOOGLE_CLIENT_ID, GOOGLE_API_KEY } from './config.js';
import { IDBStore, HierarchicalKey } from './idb-store.tsx';
import { Books, Version, BaseData, Conflict, Relationship, Pov, Entry, GraphNode, Book } from './types/types.ts';
import { GoogleDriveKVStore } from './services/googleDrive.ts';
import { migrateBooksData } from './utils/dataMigration.ts';
import { GoogleGenAI, Type } from "@google/genai";
import Header from './components/Header.tsx';
import BookListView from './components/views/BookListView.tsx';
import PovListView from './components/views/PovListView.tsx';
import EntryListView from './components/views/EntryListView.tsx';
import EditorView from './components/views/EditorView.tsx';
import GraphView from './components/views/GraphView.tsx';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.tsx';
import ConfirmImportModal from './components/modals/ConfirmImportModal.tsx';
import ConflictModal from './components/modals/ConflictModal.tsx';
import SaveVersionModal from './components/modals/SaveVersionModal.tsx';
import SettingsModal from './components/modals/SettingsModal.tsx';
import VersionSelectorModal from './components/modals/VersionSelectorModal.tsx';
import ExportModal from './components/modals/ExportModal.tsx';
import RelationshipModal from './components/modals/RelationshipModal.tsx';


// Declare the 'google' object on the window
declare global {
  interface Window {
    google: any;
    // FIX: Add gapi to the global window type to resolve TypeScript error.
    gapi: any;
  }
}

// Helper function to create example data for first-time users
const createExampleData = (): { exampleData: Books, exampleBookId: string } => {
    const bookId = 'book-hero-journey';
    const now = Date.now();

    // POV IDs
    const povProtagonistId = 'pov-protagonist';
    const povMentorId = 'pov-mentor';
    const povAntagonistId = 'pov-antagonist';
    const povUtilitiesId = 'pov-utilities';

    // Entry IDs
    const entryCallId = 'entry-call';
    const entryRefusalId = 'entry-refusal';
    const entryAidId = 'entry-aid';
    const entryThresholdId = 'entry-threshold';
    const entryOrdealId = 'entry-ordeal';
    const entryRewardId = 'entry-reward';
    const entryRoadBackId = 'entry-road-back';
    const entryDivisionId = 'entry-division';
    const entryInputAId = 'entry-input-a';
    const entryInputBId = 'entry-input-b';
    const entryOutputQId = 'entry-output-q';
    const entryOutputRId = 'entry-output-r';
    const entryNlSummaryId = 'entry-nl-summary';
    const entryOutputSummaryId = 'entry-output-summary';


    // Helper to create entry objects
    const createEntry = (id: string, title: string, content: string, x: number, y: number, inputs: string[], outputs: string[], type: 'prose' | 'js' | 'nl' | 'input' | 'output' = 'prose'): Entry => {
        const timestamp = now + Math.random() * 1000;
        const versionId = `v-${id}`;
        return {
            id,
            activeVersionId: versionId,
            type,
            versions: {
                [versionId]: {
                    id: versionId,
                    timestamp,
                    title,
                    content,
                    name: "Initial Version"
                }
            },
            x,
            y,
            inputs,
            outputs,
            dirty: false,
        };
    };

    const exampleData: Books = {
        [bookId]: {
            title: "The Hero's Journey",
            povs: {
                [povProtagonistId]: {
                    title: "Protagonist",
                    entries: {
                        [entryCallId]: createEntry(entryCallId, "The Call to Adventure", "Our hero receives a mysterious message, urging them toward an unknown destiny.", 100, 300, [], ["Refused the Call", "Accepted the Call", "Story Beat"]),
                        [entryRefusalId]: createEntry(entryRefusalId, "Refusal of the Call", "Filled with doubt and fear, the hero initially rejects the call.", 400, 150, ["From the Call"], ["To the Mentor"]),
                        [entryThresholdId]: createEntry(entryThresholdId, "Crossing the Threshold", "Committing to the journey, the hero enters the special world of the adventure.", 1000, 300, ["From Mentor's Aid"], ["To the Ordeal"]),
                        [entryRewardId]: createEntry(entryRewardId, "The Reward", "Having survived death, the hero takes possession of the treasure they've been seeking.", 1600, 150, ["From Victory"], ["To the Road Back"]),
                        [entryRoadBackId]: createEntry(entryRoadBackId, "The Road Back", "The hero begins their journey back to their ordinary life, but the adventure is not yet over.", 1900, 300, ["From the Reward"], ["Journey's End"]),
                    }
                },
                [povMentorId]: {
                    title: "Mentor",
                    entries: {
                        [entryAidId]: createEntry(entryAidId, "Supernatural Aid", "A wise mentor appears, providing the hero with the training, equipment, or advice they'll need.", 700, 300, ["Prompted by Refusal", "Prompted by Acceptance"], ["To the Threshold"]),
                    }
                },
                [povAntagonistId]: {
                    title: "Antagonist",
                    entries: {
                        [entryOrdealId]: createEntry(entryOrdealId, "The Ordeal", "The hero confronts their greatest fear in a direct confrontation with the story's primary obstacle.", 1300, 300, ["Hero Arrives"], ["Hero Victorious", "Story Beat"]),
                    }
                },
                [povUtilitiesId]: {
                    title: "Utilities",
                    entries: {
                        [entryDivisionId]: createEntry(
                            entryDivisionId,
                            "Division and Remainder",
                            "quotient = Math.floor(a / b);\nremainder = a % b;",
                            700,
                            600,
                            ['a', 'b'],
                            ['quotient', 'remainder'],
                            'js'
                        ),
                        [entryInputAId]: createEntry(entryInputAId, "Input A", "10", 400, 500, [], ["value"], 'input'),
                        [entryInputBId]: createEntry(entryInputBId, "Input B", "3", 400, 700, [], ["value"], 'input'),
                        [entryOutputQId]: createEntry(entryOutputQId, "Quotient", "", 1000, 500, ["value"], [], 'output'),
                        [entryOutputRId]: createEntry(entryOutputRId, "Remainder", "", 1000, 700, ["value"], [], 'output'),
                        [entryNlSummaryId]: createEntry(
                            entryNlSummaryId,
                            "Summarize Story",
                            "Summarize the story of the hero's journey so far, based on the provided inputs.",
                            1300,
                            600,
                            ['call', 'ordeal'],
                            ['summary'],
                            'nl'
                        ),
                        [entryOutputSummaryId]: createEntry(entryOutputSummaryId, "Summary Output", "", 1600, 600, ["value"], [], 'output'),
                    }
                }
            },
            relationships: [
                { id: `rel-${now + 1}`, sourceEntryId: entryCallId, targetEntryId: entryRefusalId, sourceLabel: "Refused the Call", targetLabel: "From the Call" },
                { id: `rel-${now + 2}`, sourceEntryId: entryCallId, targetEntryId: entryAidId, sourceLabel: "Accepted the Call", targetLabel: "Prompted by Acceptance" },
                { id: `rel-${now + 3}`, sourceEntryId: entryRefusalId, targetEntryId: entryAidId, sourceLabel: "To the Mentor", targetLabel: "Prompted by Refusal" },
                { id: `rel-${now + 4}`, sourceEntryId: entryAidId, targetEntryId: entryThresholdId, sourceLabel: "To the Threshold", targetLabel: "From Mentor's Aid" },
                { id: `rel-${now + 5}`, sourceEntryId: entryThresholdId, targetEntryId: entryOrdealId, sourceLabel: "To the Ordeal", targetLabel: "Hero Arrives" },
                { id: `rel-${now + 6}`, sourceEntryId: entryOrdealId, targetEntryId: entryRewardId, sourceLabel: "Hero Victorious", targetLabel: "From Victory" },
                { id: `rel-${now + 7}`, sourceEntryId: entryRewardId, targetEntryId: entryRoadBackId, sourceLabel: "To the Road Back", targetLabel: "From the Reward" },
                { id: `rel-${now + 8}`, sourceEntryId: entryInputAId, targetEntryId: entryDivisionId, sourceLabel: "value", targetLabel: "a", isInlined: true },
                { id: `rel-${now + 9}`, sourceEntryId: entryInputBId, targetEntryId: entryDivisionId, sourceLabel: "value", targetLabel: "b" },
                { id: `rel-${now + 10}`, sourceEntryId: entryDivisionId, targetEntryId: entryOutputQId, sourceLabel: "quotient", targetLabel: "value" },
                { id: `rel-${now + 11}`, sourceEntryId: entryDivisionId, targetEntryId: entryOutputRId, sourceLabel: "remainder", targetLabel: "value", isInlined: true },
                { id: `rel-${now + 12}`, sourceEntryId: entryCallId, targetEntryId: entryNlSummaryId, sourceLabel: "Story Beat", targetLabel: "call" },
                { id: `rel-${now + 13}`, sourceEntryId: entryOrdealId, targetEntryId: entryNlSummaryId, sourceLabel: "Story Beat", targetLabel: "ordeal" },
                { id: `rel-${now + 14}`, sourceEntryId: entryNlSummaryId, targetEntryId: entryOutputSummaryId, sourceLabel: "summary", targetLabel: "value" },
            ]
        }
    };
    return { exampleData, exampleBookId: bookId };
};

// --- React Component ---
const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [books, setBooks] = useState<Books | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict<Books> | null>(null);
  const [focusAfterRender, setFocusAfterRender] = useState<'book' | 'pov' | 'entry' | null>(null);

  const [store, setStore] = useState<GoogleDriveKVStore | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPickerApiLoaded, setIsPickerApiLoaded] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  // State for modals
  const [isSavingVersionModalOpen, setIsSavingVersionModalOpen] = useState(false);
  const [isVersionSelectorOpen, setIsVersionSelectorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'book' | 'pov' | 'entry', id: string, name: string, context?: { bookId: string } } | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dataToImport, setDataToImport] = useState<Books | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [relationshipToEdit, setRelationshipToEdit] = useState<Relationship | 'new' | Partial<Omit<Relationship, 'id'>> | null>(null);
  const [relationshipModalBookId, setRelationshipModalBookId] = useState<string | null>(null);


  const saveTimeout = useRef<number | null>(null);
  const localStore = useMemo(() => new IDBStore(), []);
  const bookTitleInputRef = useRef<HTMLInputElement>(null);
  const povTitleInputRef = useRef<HTMLInputElement>(null);
  const entryTitleInputRef = useRef<HTMLInputElement>(null);
  const BOOKS_KEY: HierarchicalKey = useMemo(() => ['app-data', 'books'], []);
  const BASE_KEY: HierarchicalKey = useMemo(() => ['app-data', 'base'], []);

  // --- Routing ---
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { view, selectedBookId, selectedPovId, selectedEntryId, fromView } = useMemo(() => {
    const queryString = hash.startsWith('#/') ? hash.substring(2) : hash.substring(1);
    const params = new URLSearchParams(queryString);
    const viewParam = params.get('view') || 'globalGraph';
    const bookId = params.get('bookId');
    const povId = params.get('povId');
    const entryId = params.get('entryId');
    const from = params.get('from');
  
    switch (viewParam) {
        case 'editor':
            return { view: 'editor' as const, selectedBookId: bookId, selectedPovId: povId, selectedEntryId: entryId, fromView: from };
        case 'entryList':
            return { view: 'entryList' as const, selectedBookId: bookId, selectedPovId: povId, selectedEntryId: null, fromView: null };
        case 'povList':
            return { view: 'povList' as const, selectedBookId: bookId, selectedPovId: null, selectedEntryId: null, fromView: null };
        case 'graph':
            return { view: 'graph' as const, selectedBookId: bookId, selectedPovId: null, selectedEntryId: null, fromView: null };
        case 'list':
            return { view: 'list' as const, selectedBookId: null, selectedPovId: null, selectedEntryId: null, fromView: null };
        case 'globalGraph':
            return { view: 'globalGraph' as const, selectedBookId: null, selectedPovId: null, selectedEntryId: null, fromView: null };
        default:
            return { view: 'globalGraph' as const, selectedBookId: null, selectedPovId: null, selectedEntryId: null, fromView: null };
    }
  }, [hash]);


  // Effect to load initial data from IndexedDB
  useEffect(() => {
    const loadLocalData = async () => {
        setIsLoading(true);
        const localBooksData = await localStore.get<Books>(BOOKS_KEY);
        if (localBooksData && Object.keys(localBooksData).length > 0) {
            const { migratedBooks, wasMigrated } = migrateBooksData(localBooksData);
            if (wasMigrated) {
                await localStore.set(BOOKS_KEY, migratedBooks);
            }
            setBooks(migratedBooks);
        } else {
            const { exampleData, exampleBookId } = createExampleData();
            setBooks(exampleData);
            await localStore.set(BOOKS_KEY, exampleData);
            window.location.hash = `#/view=graph&bookId=${exampleBookId}`;
        }
        setIsLoading(false);
    };
    loadLocalData();
  }, [localStore, BOOKS_KEY]);

  // Effect to load Google GSI and GAPI scripts
  useEffect(() => {
    const isClientIdMissing = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_');
    const isApiKeyMissing = !GOOGLE_API_KEY || GOOGLE_API_KEY.startsWith('YOUR_');

    if (isClientIdMissing || isApiKeyMissing) {
        let errorMsg = "Configuration error:";
        if (isClientIdMissing) errorMsg += " Google Client ID is not set.";
        if (isApiKeyMissing) errorMsg += " Google API Key is not set.";
        setError(errorMsg);
        return;
    }

    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
          callback: (tokenResponse: any) => {
            try {
                if (!tokenResponse || Object.keys(tokenResponse).length === 0) {
                    setError("Sign-in failed: An empty response was received.");
                    setIsLoading(false);
                    return;
                }
                if (tokenResponse.error) {
                    if (['access_denied', 'cancelled'].includes(tokenResponse.error)) {
                         setError(null);
                    } else {
                        setError(`Sign-in failed: ${tokenResponse.error_description || tokenResponse.error}`);
                    }
                    setIsLoading(false);
                    return;
                }
                if (tokenResponse.access_token) {
                  setAccessToken(tokenResponse.access_token);
                  setStore(new GoogleDriveKVStore(tokenResponse.access_token));
                } else {
                  setError("Sign-in failed: An unexpected response was received.");
                  setIsLoading(false);
                }
            } catch (e: any) {
                console.error("Error within the Google Sign-In callback:", e);
                setError(`Sign-in failed: An internal error occurred during authentication.`);
                setIsLoading(false);
            }
          },
          error_callback: (error: any) => {
            console.warn('Google Sign-In infrastructural error:', error);
            setError(null);
            setIsLoading(false);
          },
        });
        setTokenClient(client);
      } catch (e) {
        setError("Could not initialize Google Sign-In.");
      }
    };
    document.body.appendChild(gsiScript);
    
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => {
      window.gapi.load('client:picker', () => {
          setIsPickerApiLoaded(true);
      });
    };
    document.body.appendChild(gapiScript);

  }, []);

  const handleSignOut = useCallback(async () => {
    setAccessToken(null);
    setStore(null);
    setError(null);
    setConflict(null);
  }, []);
  
  // Effect for sync and conflict detection
  useEffect(() => {
    const syncData = async () => {
      if (!store) return;
      setIsLoading(true);
      setError(null);
      setConflict(null);

      try {
        const remoteData = await store.getContentAndRevision('books', {});
        const { migratedBooks: remoteBooks } = migrateBooksData(remoteData.value);
        
        const localBooksData = await localStore.get<Books>(BOOKS_KEY) ?? {};
        const { migratedBooks: localBooks } = migrateBooksData(localBooksData);
        
        const base = await localStore.get<BaseData<Books>>(BASE_KEY);
        
        if (!base) {
            const remoteIsNotEmpty = Object.keys(remoteBooks).length > 0;
            if (remoteIsNotEmpty) {
                const localIsNotEmpty = Object.keys(localBooks).length > 0;
                if (localIsNotEmpty && JSON.stringify(localBooks) !== JSON.stringify(remoteBooks)) {
                    setConflict({ local: localBooks, remote: remoteBooks, remoteRevisionId: remoteData.revisionId });
                } else {
                    setBooks(remoteBooks);
                    await localStore.set(BOOKS_KEY, remoteBooks);
                    await localStore.set(BASE_KEY, { books: remoteBooks, revisionId: remoteData.revisionId });
                }
            } else {
                await localStore.set(BASE_KEY, { books: {}, revisionId: remoteData.revisionId });
            }
        } else {
            const remoteHasChanged = remoteData.revisionId !== base.revisionId;
            const localHasChanged = JSON.stringify(localBooks) !== JSON.stringify(base.books);
          
            if (remoteHasChanged && localHasChanged) {
                if (JSON.stringify(localBooks) === JSON.stringify(remoteBooks)) {
                    await localStore.set(BASE_KEY, { books: localBooks, revisionId: remoteData.revisionId });
                } else {
                    setConflict({ local: localBooks, remote: remoteBooks, remoteRevisionId: remoteData.revisionId });
                }
            } else if (remoteHasChanged) {
                setBooks(remoteBooks);
                await localStore.set(BOOKS_KEY, remoteBooks);
                await localStore.set(BASE_KEY, { books: remoteBooks, revisionId: remoteData.revisionId });
            }
        }
      } catch (e: any) {
        setError(e.message);
        if (e.message.includes('sign in again')) handleSignOut();
      } finally {
        setIsLoading(false);
      }
    };
    syncData();
  }, [store, localStore, BOOKS_KEY, BASE_KEY, handleSignOut]);
  
    // Effect to automatically determine sync status by comparing current state to the last saved state.
    useEffect(() => {
        if (isLoading || books === null) {
            return;
        }

        const checkSyncStatus = async () => {
            const base = await localStore.get<BaseData<Books>>(BASE_KEY);
            const lastSyncedBooks = base?.books;

            if (lastSyncedBooks === undefined) {
                const booksAreEmpty = Object.keys(books).length === 0;
                setIsSynced(booksAreEmpty);
                return;
            }

            const hasChanged = JSON.stringify(books) !== JSON.stringify(lastSyncedBooks);
            setIsSynced(!hasChanged);
        };

        checkSyncStatus();
    }, [books, isLoading, localStore, BASE_KEY]);

  // Effect for debounced saving to cloud
  useEffect(() => {
    if (!store || isLoading || conflict || books === null || isSynced) {
        return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = window.setTimeout(async () => {
        const base = await localStore.get<BaseData<Books>>(BASE_KEY);
        if (base && JSON.stringify(books) === JSON.stringify(base.books)) {
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const updatedFile = await store.set('books', books);
            await localStore.set(BASE_KEY, { books, revisionId: updatedFile.headRevisionId });
            setIsSynced(true);
        } catch (e: any) {
            setError(e.message);
            if (e.message.includes('sign in again')) handleSignOut();
        } finally {
            setIsSaving(false);
        }
    }, 60000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [books, store, isLoading, conflict, localStore, BASE_KEY, handleSignOut, isSynced]);
  
  // Effect to handle auto-focusing on new items
  useEffect(() => {
    if (focusAfterRender === 'book' && bookTitleInputRef.current) {
        bookTitleInputRef.current.focus();
        setFocusAfterRender(null);
    } else if (focusAfterRender === 'pov' && povTitleInputRef.current) {
        povTitleInputRef.current.focus();
        setFocusAfterRender(null);
    } else if (focusAfterRender === 'entry' && entryTitleInputRef.current) {
        entryTitleInputRef.current.focus();
        setFocusAfterRender(null);
    }
  }, [focusAfterRender, view]);

  // --- Import / Export ---
  const handleConfirmExport = (fileName: string) => {
    if (!accessToken || !isPickerApiLoaded || !books || !fileName) return;
    setIsExportModalOpen(false);
    const developerKey = GOOGLE_API_KEY;

    const docsView = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setMimeTypes('application/vnd.google-apps.folder')
        .setSelectFolderEnabled(true);

    const picker = new window.google.picker.PickerBuilder()
        .addView(docsView)
        .enableFeature(window.google.picker.Feature.SUPPORT_DRIVE)
        .setTitle("Select a folder to export to")
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setCallback(async (data: any) => {
            if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const folder = data[window.google.picker.Response.DOCUMENTS][0];
                const folderId = folder[window.google.picker.Document.ID];
                
                setIsLoading(true);
                setError(null);
                try {
                    const boundary = '-------314159265358979323846';
                    const delimiter = `\r\n--${boundary}\r\n`;
                    const close_delim = `\r\n--${boundary}--`;
                    
                    const fileContent = JSON.stringify({ books }, null, 2);
                    const metadata = { name: fileName, mimeType: 'application/json', parents: [folderId] };

                    const multipartRequestBody =
                        delimiter +
                        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                        JSON.stringify(metadata) +
                        delimiter +
                        'Content-Type: application/json\r\n\r\n' +
                        fileContent +
                        close_delim;
                    
                    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': `multipart/related; boundary="${boundary}"`,
                        },
                        body: multipartRequestBody
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error.message || 'Failed to create file.');
                    }
                    
                    alert('Export successful!');
                } catch (e: any) {
                    setError(`Export failed: ${e.message}`);
                } finally {
                    setIsLoading(false);
                    setIsSettingsModalOpen(false);
                }
            }
        })
        .build();
    picker.setVisible(true);
  };

  const handleImport = () => {
    if (!accessToken || !isPickerApiLoaded) return;
    const developerKey = GOOGLE_API_KEY;

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes("application/json,text/plain");

    const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setTitle("Select a backup file to import")
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setCallback(async (data: any) => {
            if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const file = data[window.google.picker.Response.DOCUMENTS][0];
                const fileId = file[window.google.picker.Document.ID];
                
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (!response.ok) throw new Error('Could not read the selected file.');
                    
                    const fileContent = await response.json();

                    if (fileContent && typeof fileContent === 'object' && 'books' in fileContent) {
                        const { migratedBooks } = migrateBooksData(fileContent.books);
                        setDataToImport(migratedBooks);
                    } else {
                        throw new Error('Invalid backup file format.');
                    }
                } catch (e: any) {
                    setError(`Import failed: ${e.message}`);
                } finally {
                    setIsLoading(false);
                    setIsSettingsModalOpen(false);
                }
            }
        })
        .build();
    picker.setVisible(true);
  };
  
  const confirmImport = async () => {
      if (!dataToImport || !store) return;
      setIsLoading(true);
      setError(null);
      try {
          const updatedFile = await store.set('books', dataToImport);
          setBooks(dataToImport);
          await localStore.set(BOOKS_KEY, dataToImport);
          await localStore.set(BASE_KEY, { books: dataToImport, revisionId: updatedFile.headRevisionId });
      } catch (e: any) {
          setError(e.message);
      } finally {
          setDataToImport(null);
          setIsLoading(false);
      }
  };

  const resolveConflict = async (chosenBooks: Books) => {
    setIsLoading(true);
    setConflict(null);
    try {
        const updatedFile = await store.set('books', chosenBooks);
        setBooks(chosenBooks);
        await localStore.set(BOOKS_KEY, chosenBooks);
        await localStore.set(BASE_KEY, { books: chosenBooks, revisionId: updatedFile.headRevisionId });
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (tokenClient) {
      setIsLoading(true);
      setError(null);
      try {
        tokenClient.requestAccessToken();
      } catch (e: any) {
        setError(`Sign-in failed: An unexpected error occurred.`);
        setIsLoading(false);
      }
    }
  };

  const handleManualSync = useCallback(async () => {
    if (!store || books === null || isSaving) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    setIsSaving(true);
    setError(null);
    try {
        const updatedFile = await store.set('books', books);
        await localStore.set(BASE_KEY, { books, revisionId: updatedFile.headRevisionId });
        setIsSynced(true);
    } catch (e: any) {
        setError(e.message);
        if (e.message.includes('sign in again')) handleSignOut();
    } finally {
        setIsSaving(false);
    }
  }, [store, books, localStore, BASE_KEY, handleSignOut, isSaving]);

  // --- Navigation Handlers ---
  const handleBack = () => {
    console.log('Back button clicked at', new Date().toISOString(), 'Current hash:', window.location.hash);
    
    switch (view) {
      case 'editor':
        if (fromView === 'graph' && selectedBookId) {
          window.location.hash = `#/view=graph&bookId=${selectedBookId}`;
        } else if (selectedBookId && selectedPovId) { // Default back from editor is entryList
          window.location.hash = `#/view=entryList&bookId=${selectedBookId}&povId=${selectedPovId}`;
        } else {
          window.location.hash = '#/view=list'; // Fallback
        }
        break;
      
      case 'entryList':
        if (selectedBookId) {
          window.location.hash = `#/view=povList&bookId=${selectedBookId}`;
        } else {
          window.location.hash = '#/view=list';
        }
        break;

      case 'povList':
      case 'graph':
        // From either a single book's PoV list or its graph, go back to the all-books list.
        window.location.hash = `#/view=list`;
        break;

      // No 'default' needed, as the back button is not shown on 'list' or 'globalGraph' views.
    }
  };

  const handleNavigateToGraph = () => {
    if (selectedBookId) window.location.hash = `#/view=graph&bookId=${selectedBookId}`;
  };

  const handleNavigateToPovList = () => {
    if (selectedBookId) window.location.hash = `#/view=povList&bookId=${selectedBookId}`;
  };

  const handleNavigateToGlobalGraph = () => {
      window.location.hash = '#/view=globalGraph';
  };

  const handleNavigateToList = () => {
    window.location.hash = '#/view=list';
  };

  const handleSelectBook = (bookId: string) => {
    window.location.hash = `#/view=graph&bookId=${bookId}`;
  };

  const handleSelectPov = (povId: string) => {
    if (selectedBookId) window.location.hash = `#/view=entryList&bookId=${selectedBookId}&povId=${povId}`;
  }
  
  const handleSelectEntry = (entryId: string) => {
    if (selectedBookId && selectedPovId) window.location.hash = `#/view=editor&bookId=${selectedBookId}&povId=${selectedPovId}&entryId=${entryId}&from=entryList`;
  }

  const handleSelectEntryFromGraph = (bookId: string, povId: string, entryId: string) => {
    window.location.hash = `#/view=editor&bookId=${bookId}&povId=${povId}&entryId=${entryId}&from=graph`;
  };

    // --- Dirty Flag Logic ---
    const propagateDirtyState = useCallback((currentBooks: Books, startingBookId: string, startingEntryId: string): Books => {
        // FIX: Correctly type the `updatedBooks` variable after `JSON.parse` to prevent type errors when accessing nested properties. This resolves an issue where `pov.entries` was being accessed on an `any` type.
        const updatedBooks: Books = JSON.parse(JSON.stringify(currentBooks));
        const bookToUpdate = updatedBooks[startingBookId];
        if (!bookToUpdate || !bookToUpdate.relationships) return updatedBooks;

        const entriesToProcess = new Set<string>([startingEntryId]);
        const processedEntries = new Set<string>();

        while (entriesToProcess.size > 0) {
            const currentEntryId = entriesToProcess.values().next().value;
            entriesToProcess.delete(currentEntryId);

            if (processedEntries.has(currentEntryId)) continue;
            processedEntries.add(currentEntryId);

            for (const rel of bookToUpdate.relationships) {
                if (rel.sourceEntryId === currentEntryId) {
                    const targetEntryId = rel.targetEntryId;
                    
                    for (const pov of Object.values(bookToUpdate.povs)) {
                        if (pov.entries[targetEntryId]) {
                            const targetEntry = pov.entries[targetEntryId];
                            if (targetEntry.dirty !== true) {
                                targetEntry.dirty = true;
                            }
                            entriesToProcess.add(targetEntryId);
                            break; 
                        }
                    }
                }
            }
        }
        return updatedBooks;
    }, []);

    const modifyEntry = useCallback(async (
        modificationFn: (entry: Entry, books: Books) => void
    ) => {
        if (!selectedBookId || !selectedPovId || !selectedEntryId || !books) return;
        
        let updatedBooks = JSON.parse(JSON.stringify(books));
        
        const entryToModify = updatedBooks[selectedBookId].povs[selectedPovId].entries[selectedEntryId];
        modificationFn(entryToModify, updatedBooks);
        entryToModify.dirty = false;
        
        updatedBooks = propagateDirtyState(updatedBooks, selectedBookId, selectedEntryId);
        
        setBooks(updatedBooks);
        await localStore.set(BOOKS_KEY, updatedBooks);
    }, [books, selectedBookId, selectedPovId, selectedEntryId, propagateDirtyState, localStore, BOOKS_KEY]);


  // --- Data Modification Handlers ---
  const handleAddNewBook = async () => {
    if (!books) return;
    const newBookId = `book-${Date.now()}`;
    const newBook = { title: "", povs: {}, relationships: [] };
    const updatedBooks = { ...books, [newBookId]: newBook };
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    setFocusAfterRender('book');
    window.location.hash = `#/view=graph&bookId=${newBookId}`;
  };

  const handleAddNewPov = async () => {
    if (!books || !selectedBookId) return;
    const newPovId = `pov-${Date.now()}`;
    const newPov = { title: "", entries: {} };
    const updatedBooks = JSON.parse(JSON.stringify(books));
    updatedBooks[selectedBookId].povs[newPovId] = newPov;
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    setFocusAfterRender('pov');
    window.location.hash = `#/view=entryList&bookId=${selectedBookId}&povId=${newPovId}`;
  };

  const handleAddNewEntry = async (options?: { povId?: string, title?: string, preventNavigation?: boolean, position?: { x: number, y: number } }): Promise<string | undefined> => {
    const { povId: povIdForNewEntry, title, preventNavigation, position } = options || {};
    const povId = povIdForNewEntry || selectedPovId;
    if (!books || !selectedBookId || !povId) return;

    const newEntryId = `entry-${Date.now()}`;
    const timestamp = Date.now();
    const initialVersionId = `v-${timestamp}`;
    const newEntry: Entry = {
        id: newEntryId,
        type: 'prose',
        versions: {
            [initialVersionId]: {
                id: initialVersionId,
                timestamp: timestamp,
                content: '',
                name: 'Initial Version',
                title: title || '',
            }
        },
        activeVersionId: initialVersionId,
        x: position?.x,
        y: position?.y,
        inputs: [],
        outputs: [],
        dirty: false,
    };

    const updatedBooks = JSON.parse(JSON.stringify(books));
    updatedBooks[selectedBookId].povs[povId].entries[newEntryId] = newEntry;
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);

    if (!preventNavigation) {
        setFocusAfterRender('entry');
        window.location.hash = `#/view=editor&bookId=${selectedBookId}&povId=${povId}&entryId=${newEntryId}`;
    }
    return newEntryId;
  };

  const deleteItemImmediately = async (item: { type: 'book' | 'pov' | 'entry', id: string, context?: { bookId?: string } }) => {
      if (!books) return;
      const { type, id, context } = item;
      const updatedBooks: Books = JSON.parse(JSON.stringify(books));

      if (type === 'book') {
          delete updatedBooks[id];
          if (selectedBookId === id) handleNavigateToList();
      } else if (type === 'pov' && selectedBookId) {
          delete updatedBooks[selectedBookId].povs[id];
          if (selectedPovId === id) handleBack();
      } else if (type === 'entry') {
          const bookIdForDeletion = context?.bookId || selectedBookId;
          if (!bookIdForDeletion || !updatedBooks[bookIdForDeletion]) return;

          let povIdContainingEntry: string | null = null;
          for (const povId in updatedBooks[bookIdForDeletion].povs) {
              if (updatedBooks[bookIdForDeletion].povs[povId].entries[id]) {
                  povIdContainingEntry = povId;
                  break;
              }
          }
          if (povIdContainingEntry) {
              delete updatedBooks[bookIdForDeletion].povs[povIdContainingEntry].entries[id];
              if (updatedBooks[bookIdForDeletion].relationships) {
                  updatedBooks[bookIdForDeletion].relationships = updatedBooks[bookIdForDeletion].relationships.filter(
                      (rel: Relationship) => rel.sourceEntryId !== id && rel.targetEntryId !== id
                  );
              }
          }

          if (selectedEntryId === id && view === 'editor') {
              handleBack();
          }
      }
      
      setBooks(updatedBooks);
      await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleDeleteRequest = (item: { type: 'book' | 'pov' | 'entry', id: string, name: string, context?: { bookId: string } }) => {
      if (!books) return;
      const { type, id, context } = item;

      if (type === 'book') {
          const bookToDelete = books[id];
          if (bookToDelete && bookToDelete.title.trim() === '' && Object.keys(bookToDelete.povs).length === 0) {
              deleteItemImmediately(item);
          } else {
              setItemToDelete(item);
          }
          return;
      }

      if (type === 'pov' && selectedBookId) {
          const povToDelete = books[selectedBookId].povs[id];
          if (povToDelete && povToDelete.title.trim() === '' && Object.keys(povToDelete.entries).length === 0) {
              deleteItemImmediately(item);
          } else {
              setItemToDelete(item);
          }
          return;
      }

      if (type === 'entry') {
          const bookIdForDeletion = context?.bookId || selectedBookId;
          if (!bookIdForDeletion) return;

          const book = books[bookIdForDeletion];
          if (!book) return;

          let entry: Entry | null = null;
          // FIX: Explicitly type `pov` as `Pov` to prevent it from being inferred as `unknown` when iterating over Object.values.
          for (const pov of Object.values(book.povs) as Pov[]) {
              if (pov.entries[id]) {
                  entry = pov.entries[id];
                  break;
              }
          }

          if (!entry) return;

          const activeVersion = entry.versions[entry.activeVersionId];
          const isUntitled = activeVersion.title.trim() === '';
          const isEmptyContent = !activeVersion.content || activeVersion.content.trim() === '';

          if (isUntitled && isEmptyContent) {
              deleteItemImmediately(item);
          } else {
              setItemToDelete(item);
          }
          return;
      }

      // Fallback for any unhandled cases, though the above should be exhaustive.
      setItemToDelete(item);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteItemImmediately(itemToDelete);
    setItemToDelete(null);
  };
  
  const handleTextChange = useCallback(async (newText: string) => {
    await modifyEntry(entry => {
        const activeVersionId = entry.activeVersionId;
        entry.versions[activeVersionId].content = newText;
    });
  }, [modifyEntry]);

  const handleBookTitleChange = async (newTitle: string) => {
    if (!selectedBookId || !books) return;
    const updatedBooks = JSON.parse(JSON.stringify(books));
    updatedBooks[selectedBookId].title = newTitle;
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handlePovTitleChange = async (newTitle: string) => {
      if (!selectedBookId || !selectedPovId || !books) return;
      const updatedBooks = JSON.parse(JSON.stringify(books));
      updatedBooks[selectedBookId].povs[selectedPovId].title = newTitle;
      setBooks(updatedBooks);
      await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleEntryTitleChange = useCallback(async (newTitle: string) => {
    await modifyEntry(entry => {
        const activeVersionId = entry.activeVersionId;
        entry.versions[activeVersionId].title = newTitle;
    });
  }, [modifyEntry]);

  const handleEntryTypeChange = useCallback(async (newType: 'prose' | 'js' | 'nl') => {
    await modifyEntry(entry => {
        entry.type = newType;
    });
  }, [modifyEntry]);

  const handleEntrySocketAdd = useCallback(async (type: 'input' | 'output', label: string) => {
    if (!label.trim()) return;
    await modifyEntry(entry => {
        if (entry.type === 'input' || entry.type === 'output') {
            alert("Input and Output nodes have fixed sockets that cannot be modified.");
            return;
        }
        const sockets = type === 'input' ?
            (entry.inputs || (entry.inputs = [])) :
            (entry.outputs || (entry.outputs = []));
        
        if (sockets.includes(label.trim())) {
            alert(`A socket named "${label.trim()}" already exists.`);
            return;
        }
        sockets.push(label.trim());
    });
  }, [modifyEntry]);

  const handleEntrySocketChange = useCallback(async (type: 'input' | 'output', oldLabel: string, newLabel: string) => {
     await modifyEntry(entry => {
        if (entry.type === 'input' || entry.type === 'output') {
            alert("Input and Output nodes have fixed sockets that cannot be modified.");
            return;
        }
        const sockets = type === 'input' ? entry.inputs : entry.outputs;
        if (!sockets) return;

        const index = sockets.indexOf(oldLabel);
        if (index === -1) return;

        const trimmedNewLabel = newLabel.trim();
        if (!trimmedNewLabel) { 
            sockets.splice(index, 1);
        } else if (sockets.some((s: string, i: number) => s === trimmedNewLabel && i !== index)) {
            alert(`A socket named "${trimmedNewLabel}" already exists.`);
            return;
        } else {
            sockets[index] = trimmedNewLabel;
        }
    });
  }, [modifyEntry]);

  const handleEntrySocketDelete = useCallback(async (type: 'input' | 'output', label: string) => {
    await modifyEntry(entry => {
        if (entry.type === 'input' || entry.type === 'output') {
            alert("Input and Output nodes have fixed sockets that cannot be modified.");
            return;
        }
        const sockets = type === 'input' ? entry.inputs : entry.outputs;
        if (!sockets) return;

        const index = sockets.indexOf(label);
        if (index > -1) {
            sockets.splice(index, 1);
        }
    });
  }, [modifyEntry]);

  // --- Graph View Handlers ---
  const handleGraphBackgroundClick = async (position: { x: number, y: number }) => {
    if (!selectedBookId || !books) return;
    const selectedBook = books[selectedBookId];
    const povs = selectedBook.povs;
    const firstPovId = Object.keys(povs)[0];

    if (!firstPovId) {
        alert("Please create a Point of View first before adding entries to the graph.");
        return;
    }

    await handleAddNewEntry({ povId: firstPovId, preventNavigation: true, position });
  };

  const handleGlobalGraphBackgroundClick = async (position: { x: number, y: number }) => {
    if (!books) return;

    const timestamp = Date.now();
    const newBookId = `book-${timestamp}`;
    const newPovId = `pov-${timestamp}`;
    const newEntryId = `entry-${timestamp}`;
    const initialVersionId = `v-${timestamp}`;

    const newEntry: Entry = {
        id: newEntryId,
        type: 'prose',
        versions: {
            [initialVersionId]: {
                id: initialVersionId,
                timestamp: timestamp,
                content: '',
                name: 'Initial Version',
                title: '',
            }
        },
        activeVersionId: initialVersionId,
        x: position.x,
        y: position.y,
        inputs: [],
        outputs: [],
        dirty: false,
    };

    const newPov: Pov = { title: "", entries: { [newEntryId]: newEntry } };
    const newBook = { title: "", povs: { [newPovId]: newPov }, relationships: [] };
    
    const updatedBooks = { ...books, [newBookId]: newBook };
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleNodePositionChange = useCallback((node: GraphNode, position: { x: number; y: number }) => {
    const { id: nodeId, bookId, povId } = node;
    setBooks(currentBooks => {
        if (!currentBooks) return null;
        
        const entryToUpdate = currentBooks[bookId]?.povs?.[povId]?.entries?.[nodeId];
        if (!entryToUpdate || (entryToUpdate.x === position.x && entryToUpdate.y === position.y)) {
            return currentBooks;
        }

        const updatedBooks: Books = JSON.parse(JSON.stringify(currentBooks));
        updatedBooks[bookId].povs[povId].entries[nodeId].x = position.x;
        updatedBooks[bookId].povs[povId].entries[nodeId].y = position.y;
        
        localStore.set(BOOKS_KEY, updatedBooks);
        return updatedBooks;
    });
  }, [localStore, BOOKS_KEY]);

  const handleNodeContentChange = useCallback(async (node: GraphNode, newContent: string) => {
    if (!books) return;
    const { bookId, povId, id: entryId } = node;

    let updatedBooks = JSON.parse(JSON.stringify(books));
    const entryToUpdate = updatedBooks[bookId]?.povs?.[povId]?.entries?.[entryId];
    if (!entryToUpdate) return;
    
    const activeVersion = entryToUpdate.versions[entryToUpdate.activeVersionId];
    if (activeVersion.content === newContent) return;

    activeVersion.content = newContent;
    entryToUpdate.dirty = false;
    
    updatedBooks = propagateDirtyState(updatedBooks, bookId, entryId);
    
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  }, [books, localStore, BOOKS_KEY, propagateDirtyState]);

  const handleUpdateInlinedValue = useCallback(async (relationshipId: string, newContent: string, bookId: string) => {
      if (!books) return;
  
      let updatedBooks = JSON.parse(JSON.stringify(books));
      const book = updatedBooks[bookId];
      if (!book || !book.relationships) return;
  
      const relationship = book.relationships.find((r: Relationship) => r.id === relationshipId);
      if (!relationship) return;
  
      const sourceEntryId = relationship.sourceEntryId;
      let sourcePovId: string | null = null;
      for (const [povId, pov] of Object.entries(book.povs)) {
          if ((pov as Pov).entries[sourceEntryId]) {
              sourcePovId = povId;
              break;
          }
      }
  
      if (!sourcePovId) return;
  
      const entryToUpdate = (book.povs as Record<string, Pov>)[sourcePovId].entries[sourceEntryId];
      const activeVersion = entryToUpdate.versions[entryToUpdate.activeVersionId];
  
      if (activeVersion.content === newContent) return;
  
      activeVersion.content = newContent;
      entryToUpdate.dirty = false;
      
      updatedBooks = propagateDirtyState(updatedBooks, bookId, sourceEntryId);
      
      setBooks(updatedBooks);
      await localStore.set(BOOKS_KEY, updatedBooks);
  }, [books, localStore, BOOKS_KEY, propagateDirtyState]);

  const handleAddSocket = async (node: GraphNode, type: 'input' | 'output', label: string) => {
    if (!books || !label || node.type === 'input' || node.type === 'output') return;
    const { bookId, povId, id: entryId } = node;

    const updatedBooks = JSON.parse(JSON.stringify(books));
    const entryToUpdate = updatedBooks[bookId]?.povs?.[povId]?.entries?.[entryId];
    if (!entryToUpdate) return;

    if (type === 'input') {
        if (!entryToUpdate.inputs) entryToUpdate.inputs = [];
        if (!entryToUpdate.inputs.includes(label)) {
            entryToUpdate.inputs.push(label);
        } else if (!label.startsWith('__editing_')) { return; } 
    } else { // output
        if (!entryToUpdate.outputs) entryToUpdate.outputs = [];
        if (!entryToUpdate.outputs.includes(label)) {
            entryToUpdate.outputs.push(label);
        } else if (!label.startsWith('__editing_')) { return; } 
    }

    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleUpdateSocketLabel = async (node: GraphNode, type: 'input' | 'output', oldLabel: string, newLabel: string) => {
    if (!books || node.type === 'input' || node.type === 'output') return;
    const { bookId, povId, id: entryId } = node;

    let updatedBooks = JSON.parse(JSON.stringify(books));
    const entryToUpdate = updatedBooks[bookId]?.povs?.[povId]?.entries?.[entryId];
    if (!entryToUpdate) return;

    const sockets = type === 'input' ?
        (entryToUpdate.inputs || (entryToUpdate.inputs = [])) :
        (entryToUpdate.outputs || (entryToUpdate.outputs = []));

    const index = sockets.indexOf(oldLabel);
    if (index === -1) {
        console.warn(`Old socket label "${oldLabel}" not found for update.`);
        return;
    }

    const trimmedNewLabel = newLabel.trim();

    if (trimmedNewLabel) {
        if (sockets.some((s: string, i: number) => s === trimmedNewLabel && i !== index)) {
            alert(`A socket named "${trimmedNewLabel}" already exists on this node.`);
            if (oldLabel.startsWith('__editing_')) {
                sockets.splice(index, 1);
            }
            setBooks(updatedBooks);
            await localStore.set(BOOKS_KEY, updatedBooks);
            return; 
        }
        sockets[index] = trimmedNewLabel;
    } else {
        sockets.splice(index, 1);
    }

    entryToUpdate.dirty = false;
    updatedBooks = propagateDirtyState(updatedBooks, bookId, entryId);

    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleGenerateIdeas = async (sourceNode: GraphNode) => {
      if (!books) return;
      setIsLoading(true);
      setError(null);
  
      try {
          const sourceEntry = books[sourceNode.bookId]?.povs[sourceNode.povId]?.entries[sourceNode.id];
          if (!sourceEntry) throw new Error("Source entry not found.");
  
          const sourceVersion = sourceEntry.versions[sourceEntry.activeVersionId];
          const prompt = `Based on the following entry titled "${sourceVersion.title}" with the content "${sourceVersion.content}", generate 4 related ideas. For each idea, provide a short title and a one-sentence summary. Return the response as a JSON array of objects, where each object has "title" and "summary" keys.`;
  
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const responseSchema = {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      title: { type: Type.STRING },
                      summary: { type: Type.STRING },
                  },
                  required: ["title", "summary"],
              },
          };
  
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: responseSchema,
              },
          });
  
          const generatedIdeas = JSON.parse(response.text);
          const updatedBooks: Books = JSON.parse(JSON.stringify(books));
          const radius = 300; 
  
          generatedIdeas.forEach((idea: { title: string; summary: string }, index: number) => {
              const timestamp = Date.now() + index;
              const newEntryId = `entry-${timestamp}`;
              const initialVersionId = `v-${timestamp}`;
              const angle = (2 * Math.PI / generatedIdeas.length) * index;
              const newEntry: Entry = {
                  id: newEntryId,
                  type: 'prose',
                  versions: {
                      [initialVersionId]: {
                          id: initialVersionId,
                          timestamp,
                          content: idea.summary,
                          name: 'Initial Version',
                          title: idea.title,
                      }
                  },
                  activeVersionId: initialVersionId,
                  x: (sourceNode.x ?? 0) + radius * Math.cos(angle),
                  y: (sourceNode.y ?? 0) + radius * Math.sin(angle),
                  inputs: [],
                  outputs: [],
              };
              updatedBooks[sourceNode.bookId].povs[sourceNode.povId].entries[newEntryId] = newEntry;
          });
  
          setBooks(updatedBooks);
          await localStore.set(BOOKS_KEY, updatedBooks);
  
      } catch (e: any) {
          console.error("Error generating ideas:", e);
          setError(`Failed to generate ideas: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };

  const handleRecomputeCode = async (node: GraphNode) => {
    if (!books || !node.bookId) return;

    const book = books[node.bookId];
    if (!book) return;

    let codeEntry: Entry | undefined;
    let povIdForCodeEntry: string | undefined;
    // FIX: Explicitly cast the result of Object.entries to correctly type `pov`. This resolves errors when accessing `pov.entries`.
    for (const [povId, pov] of Object.entries(book.povs) as [string, Pov][]) {
        if (pov.entries[node.id]) {
            codeEntry = pov.entries[node.id];
            povIdForCodeEntry = povId;
            break;
        }
    }

    if (!codeEntry || codeEntry.type !== 'js' || !povIdForCodeEntry) return;

    const activeVersion = codeEntry.versions[codeEntry.activeVersionId];
    if (!activeVersion || !activeVersion.content) return;
    const codeToExecute = activeVersion.content;

    // 1. Gather inputs and check if any are dirty
    const inputs: { [key: string]: any } = {};
    const inputRelationships = (book.relationships || []).filter(rel => rel.targetEntryId === node.id);
    
    const allEntriesMap = new Map<string, Entry>();
    // FIX: Explicitly type `pov` as `Pov` in the forEach callback to prevent it from being inferred as `unknown`.
    Object.values(book.povs).forEach((pov: Pov) => {
        Object.values(pov.entries).forEach((entry: Entry) => allEntriesMap.set(entry.id, entry));
    });

    let isAnyInputDirty = false;
    for (const rel of inputRelationships) {
        const sourceNode = allEntriesMap.get(rel.sourceEntryId);
        if (sourceNode) {
            if (sourceNode.dirty) {
                isAnyInputDirty = true;
            }
            const sourceValue = sourceNode.versions[sourceNode.activeVersionId].content;
            inputs[rel.targetLabel] = sourceValue;
        }
    }

    // 2. Execute code
    let outputValues: { [key: string]: any } = {};
    try {
        const inputNames = Object.keys(inputs);
        const code = `
            ${inputNames.map(name => `let ${name} = ${JSON.stringify(inputs[name])};`).join('\n')}
            ${inputNames.map(name => `if (!isNaN(parseFloat(${name}))) ${name} = parseFloat(${name});`).join('\n')}
            ${(codeEntry.outputs || []).map(name => `let ${name};`).join('\n')}
            ${codeToExecute}
            const __outputs = {};
            ${(codeEntry.outputs || []).map(name => `__outputs['${name}'] = typeof ${name} === 'undefined' ? null : ${name};`).join('\n')}
            return __outputs;
        `;
        const func = new Function(code);
        outputValues = func();
    } catch (e: any) {
        setError(`Error executing code: ${e.message}`);
        console.error("Code execution error:", e);
        return;
    }
    
    // 3. Update outputs, self, and propagate dirty state
    // FIX: Explicitly type `updatedBooks` as `Books` to prevent type errors when accessing nested properties.
    let updatedBooks: Books = JSON.parse(JSON.stringify(books));
    let entriesToPropagateDirty = new Set<string>();

    for (const outputLabel in outputValues) {
        if (Object.prototype.hasOwnProperty.call(outputValues, outputLabel)) {
            const value = outputValues[outputLabel];
            const outputRelationships = (updatedBooks[node.bookId].relationships || []).filter(
                (rel: Relationship) => rel.sourceEntryId === node.id && rel.sourceLabel === outputLabel
            );
            
            for (const rel of outputRelationships) {
                let targetEntry: Entry | undefined;
// FIX: Cast pov to Pov to avoid accessing properties on 'unknown'.
                for (const pov of Object.values(updatedBooks[node.bookId].povs) as Pov[]) {
                    if (pov.entries[rel.targetEntryId]) {
                        targetEntry = pov.entries[rel.targetEntryId];
                        break;
                    }
                }
                
                if (targetEntry) {
                    const targetVersion = targetEntry.versions[targetEntry.activeVersionId];
                    const newValue = String(value ?? '');
                    if (targetVersion.content !== newValue) {
                        targetVersion.content = newValue;
                        targetEntry.dirty = false;
                        entriesToPropagateDirty.add(targetEntry.id);
                    }
                }
            }
        }
    }

    // If a code entry is recomputed and its inputs were not dirty, it becomes clean.
    if (!isAnyInputDirty) {
        const recomputedCodeEntry = updatedBooks[node.bookId].povs[povIdForCodeEntry].entries[node.id];
        if (recomputedCodeEntry) {
            recomputedCodeEntry.dirty = false;
        }
    }

    let booksForPropagation = updatedBooks;
    for (const entryId of entriesToPropagateDirty) {
        booksForPropagation = propagateDirtyState(booksForPropagation, node.bookId, entryId);
    }
    
    setBooks(booksForPropagation);
    await localStore.set(BOOKS_KEY, booksForPropagation);
  };

  const handleRecomputeNL = async (node: GraphNode) => {
    if (!books || !node.bookId) return;

    const book = books[node.bookId];
    if (!book) return;

    let nlEntry: Entry | undefined;
    let povIdForNLEntry: string | undefined;
    // FIX: Explicitly cast the result of Object.entries to correctly type `pov`. This resolves errors when accessing `pov.entries`.
    for (const [povId, pov] of Object.entries(book.povs) as [string, Pov][]) {
        if (pov.entries[node.id]) {
            nlEntry = pov.entries[node.id];
            povIdForNLEntry = povId;
            break;
        }
    }

    if (!nlEntry || nlEntry.type !== 'nl' || !povIdForNLEntry) return;

    const activeVersion = nlEntry.versions[nlEntry.activeVersionId];
    if (!activeVersion || !activeVersion.content) return;
    const instruction = activeVersion.content;

    const inputs: { [key: string]: string } = {};
    const inputRelationships = (book.relationships || []).filter(rel => rel.targetEntryId === node.id);
    
    const allEntriesMap = new Map<string, Entry>();
    // FIX: Explicitly type `pov` as `Pov` in the forEach callback to prevent it from being inferred as `unknown`.
    Object.values(book.povs).forEach((pov: Pov) => {
        Object.values(pov.entries).forEach((entry: Entry) => allEntriesMap.set(entry.id, entry));
    });

    for (const rel of inputRelationships) {
        const sourceNode = allEntriesMap.get(rel.sourceEntryId);
        if (sourceNode) {
            const sourceValue = sourceNode.versions[sourceNode.activeVersionId].content;
            inputs[rel.targetLabel] = sourceValue;
        }
    }

    let prompt = `${instruction}\n\n`;
    if (Object.keys(inputs).length > 0) {
        prompt += "Here is the input data:\n";
        for (const [key, value] of Object.entries(inputs)) {
            prompt += `--- ${key} ---\n${value}\n\n`;
        }
    }
    
    setIsLoading(true);
    setError(null);
    let generatedText = '';

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        generatedText = response.text;
    } catch (e: any) {
        setError(`Error executing NL prompt: ${e.message}`);
        console.error("NL execution error:", e);
        setIsLoading(false);
        return;
    } finally {
        setIsLoading(false);
    }

    // FIX: Explicitly type `updatedBooks` as `Books` to prevent type errors when accessing nested properties.
    let updatedBooks: Books = JSON.parse(JSON.stringify(books));
    let entriesToPropagateDirty = new Set<string>();

    const nlOutputs = (nlEntry.outputs || []);
    for (const outputLabel of nlOutputs) {
        const outputRelationships = (updatedBooks[node.bookId].relationships || []).filter(
            (rel: Relationship) => rel.sourceEntryId === node.id && rel.sourceLabel === outputLabel
        );
        
        for (const rel of outputRelationships) {
            let targetEntry: Entry | undefined;
// FIX: Cast pov to Pov to avoid accessing properties on 'unknown'.
            for (const pov of Object.values(updatedBooks[node.bookId].povs) as Pov[]) {
                if (pov.entries[rel.targetEntryId]) {
                    targetEntry = pov.entries[rel.targetEntryId];
                    break;
                }
            }
            
            if (targetEntry) {
                const targetVersion = targetEntry.versions[targetEntry.activeVersionId];
                const newValue = generatedText ?? ''; 
                if (targetVersion.content !== newValue) {
                    targetVersion.content = newValue;
                    targetEntry.dirty = false;
                    entriesToPropagateDirty.add(targetEntry.id);
                }
            }
        }
    }

    const recomputedNLEntry = updatedBooks[node.bookId].povs[povIdForNLEntry].entries[node.id];
    if (recomputedNLEntry) {
        recomputedNLEntry.dirty = false;
    }

    let booksForPropagation = updatedBooks;
    for (const entryId of entriesToPropagateDirty) {
        booksForPropagation = propagateDirtyState(booksForPropagation, node.bookId, entryId);
    }
    
    setBooks(booksForPropagation);
    await localStore.set(BOOKS_KEY, booksForPropagation);
  };

  // --- Versioning Handlers ---
  const handleConfirmSaveNewVersion = async (versionName: string) => {
    if (!selectedBookId || !selectedPovId || !selectedEntryId || !books || !versionName.trim()) return;

    let updatedBooks = JSON.parse(JSON.stringify(books));
    const entryToUpdate = updatedBooks[selectedBookId].povs[selectedPovId].entries[selectedEntryId];

    const activeVersion = entryToUpdate.versions[entryToUpdate.activeVersionId];
    const newVersionId = `v-${Date.now()}`;
    const newVersion: Version = {
        ...activeVersion,
        id: newVersionId,
        timestamp: Date.now(),
        name: versionName.trim(),
    };
    
    entryToUpdate.versions[newVersionId] = newVersion;
    entryToUpdate.activeVersionId = newVersionId;
    entryToUpdate.dirty = false;
    
    updatedBooks = propagateDirtyState(updatedBooks, selectedBookId, selectedEntryId);

    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    setIsSavingVersionModalOpen(false);
  };

  const handleSelectVersion = async (versionId: string) => {
    if (!selectedBookId || !selectedPovId || !selectedEntryId || !books) return;
    
    let updatedBooks = JSON.parse(JSON.stringify(books));
    const entryToUpdate = updatedBooks[selectedBookId].povs[selectedPovId].entries[selectedEntryId];
    entryToUpdate.activeVersionId = versionId;
    entryToUpdate.dirty = false;

    updatedBooks = propagateDirtyState(updatedBooks, selectedBookId, selectedEntryId);

    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    setIsVersionSelectorOpen(false);
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!selectedBookId || !selectedPovId || !selectedEntryId || !books) return;

    const currentEntry = books[selectedBookId].povs[selectedPovId].entries[selectedEntryId];
    if (Object.keys(currentEntry.versions).length <= 1) {
        alert("You cannot delete the only version of this entry.");
        return;
    }

    if (window.confirm("Are you sure you want to delete this version? This action cannot be undone.")) {
        const updatedBooks = JSON.parse(JSON.stringify(books));
        const entryToUpdate = updatedBooks[selectedBookId].povs[selectedPovId].entries[selectedEntryId];
        delete entryToUpdate.versions[versionId];

        if (entryToUpdate.activeVersionId === versionId) {
            entryToUpdate.activeVersionId = (Object.values(entryToUpdate.versions) as Version[]).sort((a, b) => b.timestamp - a.timestamp)[0].id;
        }
        setBooks(updatedBooks);
        await localStore.set(BOOKS_KEY, updatedBooks);
    }
  };

  const handleRenameVersion = async (versionId: string, newName: string) => {
    if (!selectedBookId || !selectedPovId || !selectedEntryId || !books || !newName.trim()) return;

    await modifyEntry((entry) => {
        entry.versions[versionId].name = newName.trim();
    });
  };

  // --- Relationship Handlers ---
  const handleOpenNewRelationshipModal = () => {
    if (selectedBookId) {
        setRelationshipModalBookId(selectedBookId);
        setRelationshipToEdit('new');
    }
  };

  const handleEditRelationship = (rel: Relationship & { bookId?: string }) => {
    const bookIdForModal = view === 'globalGraph' ? rel.bookId : selectedBookId;
    if (!bookIdForModal) {
        console.error("Could not determine book context for editing relationship.");
        return;
    }
    setRelationshipModalBookId(bookIdForModal);
    setRelationshipToEdit(rel);
  };

  const handleCloseRelationshipModal = () => {
    setRelationshipToEdit(null);
    setRelationshipModalBookId(null);
  };

  const handleSaveRelationship = async (data: { id?: string; sourceEntryId: string; targetEntryId: string; sourceLabel: string; targetLabel: string }) => {
    const bookIdToUpdate = relationshipModalBookId;
    if (!bookIdToUpdate || !books) return;
    
    // Constraint: An input socket (targetEntry + targetLabel) can only have one connection.
    if (!data.id) { // Only check for new relationships
        const existingConnection = books[bookIdToUpdate].relationships?.find(
            rel => rel.targetEntryId === data.targetEntryId && rel.targetLabel === data.targetLabel
        );
        if (existingConnection) {
            alert(`The input socket "${data.targetLabel}" is already connected. An input can only have one connection.`);
            return;
        }
    }

    const updatedBooks = JSON.parse(JSON.stringify(books));
    const bookToUpdate = updatedBooks[bookIdToUpdate];
    if (!bookToUpdate.relationships) bookToUpdate.relationships = [];

    if (data.id) { // Editing
        const index = bookToUpdate.relationships.findIndex((r: Relationship) => r.id === data.id);
        if (index > -1) {
            bookToUpdate.relationships[index] = { ...bookToUpdate.relationships[index], ...data };
        }
    } else { // Adding
        const newRelationship: Relationship = {
            id: `rel-${Date.now()}`,
            sourceEntryId: data.sourceEntryId,
            targetEntryId: data.targetEntryId,
            sourceLabel: data.sourceLabel,
            targetLabel: data.targetLabel,
        };
        bookToUpdate.relationships.push(newRelationship);
    }
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    handleCloseRelationshipModal();
  };
  
  const handleAddRelationshipDirectly = async (data: { sourceEntryId: string; targetEntryId: string; sourceLabel: string; targetLabel: string; bookId: string; }) => {
      const { bookId: bookIdToUpdate, sourceEntryId, targetEntryId, sourceLabel, targetLabel } = data;
      if (!bookIdToUpdate || !books) return;
  
      const updatedBooks = JSON.parse(JSON.stringify(books));
      const bookToUpdate = updatedBooks[bookIdToUpdate];
      if (!bookToUpdate.relationships) bookToUpdate.relationships = [];
      
      let sourceNodeIsInput = false;
      for (const pov of Object.values(bookToUpdate.povs) as Pov[]) {
          if (pov.entries[sourceEntryId] && pov.entries[sourceEntryId].type === 'input') {
              sourceNodeIsInput = true;
              break;
          }
      }

      let targetNodeIsOutput = false;
      for (const pov of Object.values(bookToUpdate.povs) as Pov[]) {
          if (pov.entries[targetEntryId] && pov.entries[targetEntryId].type === 'output') {
              targetNodeIsOutput = true;
              break;
          }
      }
  
      const newRelationship: Relationship = {
          id: `rel-${Date.now()}`,
          sourceEntryId,
          targetEntryId,
          sourceLabel,
          targetLabel,
          isInlined: sourceNodeIsInput || targetNodeIsOutput,
      };
      bookToUpdate.relationships.push(newRelationship);
  
      setBooks(updatedBooks);
      await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleAddSocketAndConnect = async (data: {
      targetNode: GraphNode;
      newSocketType: 'input' | 'output';
      newSocketLabel: string;
      sourceEntryId: string;
      sourceSocketLabel: string;
      targetSocketLabel: string;
  }) => {
      const { targetNode, newSocketType, newSocketLabel, sourceEntryId, sourceSocketLabel, targetSocketLabel } = data;
      const targetEntryId = targetNode.id;
  
      if (!books) return;
      
      const updatedBooks = JSON.parse(JSON.stringify(books));
      const { bookId, povId, id: entryId } = targetNode;
      
      // 1. Add socket
      const entryToUpdate = updatedBooks[bookId]?.povs?.[povId]?.entries?.[entryId];
      if (!entryToUpdate) return;
      
      if (newSocketType === 'input') {
          if (!entryToUpdate.inputs) entryToUpdate.inputs = [];
          if (entryToUpdate.inputs.includes(newSocketLabel)) {
              alert(`A socket named "${newSocketLabel}" already exists on this node.`);
              return; // Abort
          }
          entryToUpdate.inputs.push(newSocketLabel);
      } else { // output
          if (!entryToUpdate.outputs) entryToUpdate.outputs = [];
          if (entryToUpdate.outputs.includes(newSocketLabel)) {
              alert(`A socket named "${newSocketLabel}" already exists on this node.`);
              return; // Abort
          }
          entryToUpdate.outputs.push(newSocketLabel);
      }
  
      // 2. Add relationship
      const bookToUpdate = updatedBooks[bookId];
      if (!bookToUpdate.relationships) bookToUpdate.relationships = [];
      
      let sourceNodeIsInput = false;
      for (const pov of Object.values(bookToUpdate.povs) as Pov[]) {
          if (pov.entries[sourceEntryId] && pov.entries[sourceEntryId].type === 'input') {
              sourceNodeIsInput = true;
              break;
          }
      }

      let targetNodeIsOutput = false;
      for (const pov of Object.values(bookToUpdate.povs) as Pov[]) {
          if (pov.entries[targetEntryId] && pov.entries[targetEntryId].type === 'output') {
              targetNodeIsOutput = true;
              break;
          }
      }

      const newRelationship: Relationship = {
          id: `rel-${Date.now()}`,
          sourceEntryId,
          targetEntryId,
          sourceLabel: sourceSocketLabel,
          targetLabel: targetSocketLabel,
          isInlined: sourceNodeIsInput || targetNodeIsOutput,
      };
  
      if (newSocketType === 'input') {
          const existingConnection = bookToUpdate.relationships.find(
              (rel: Relationship) => rel.targetEntryId === newRelationship.targetEntryId && rel.targetLabel === newRelationship.targetLabel
          );
          if (existingConnection) {
              alert(`The input socket "${newRelationship.targetLabel}" is already connected. An input can only have one connection.`);
              return; // Abort without saving changes
          }
      }
      
      bookToUpdate.relationships.push(newRelationship);
  
      setBooks(updatedBooks);
      await localStore.set(BOOKS_KEY, updatedBooks);
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    const bookIdToUpdate = relationshipModalBookId;
    if (!bookIdToUpdate || !books) return;
    if (!window.confirm("Are you sure you want to delete this relationship?")) return;

    const updatedBooks = JSON.parse(JSON.stringify(books));
    const bookToUpdate = updatedBooks[bookIdToUpdate];
    if (bookToUpdate.relationships) {
        bookToUpdate.relationships = bookToUpdate.relationships.filter((r: Relationship) => r.id !== relationshipId);
    }
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
    handleCloseRelationshipModal();
  };

  const handleToggleRelationshipInlined = useCallback(async (relationshipId: string, bookId: string, referenceNode: GraphNode, forceState?: boolean) => {
    if (!books) return;
    
    const updatedBooks = JSON.parse(JSON.stringify(books));
    const book = updatedBooks[bookId];
    if (!book || !book.relationships) return;
    
    const relIndex = book.relationships.findIndex((r: Relationship) => r.id === relationshipId);
    if (relIndex === -1) return;
    
    const relationship = book.relationships[relIndex];
    
    const currentInlinedState = relationship.isInlined ?? false;
    const newInlinedState = typeof forceState === 'boolean' ? forceState : !currentInlinedState;

    if (newInlinedState === currentInlinedState) return;

    relationship.isInlined = newInlinedState;

    if (newInlinedState === false) { // Ejecting a node
        const sourceEntryId = relationship.sourceEntryId;
        const targetEntryId = relationship.targetEntryId;
        let sourceNodeInfo: { povId: string, entry: Entry } | null = null;
        let targetNodeInfo: { povId: string, entry: Entry } | null = null;
        
        for (const [povId, pov] of Object.entries(book.povs)) {
            if ((pov as Pov).entries[sourceEntryId]) {
                sourceNodeInfo = { povId, entry: (pov as Pov).entries[sourceEntryId] };
            }
            if ((pov as Pov).entries[targetEntryId]) {
                targetNodeInfo = { povId, entry: (pov as Pov).entries[targetEntryId] };
            }
            if (sourceNodeInfo && targetNodeInfo) break;
        }

        if (sourceNodeInfo?.entry.type === 'input') {
            const entryToUpdate = (book.povs as Record<string, Pov>)[sourceNodeInfo.povId].entries[sourceEntryId];
            entryToUpdate.x = (referenceNode.x ?? 0) - 200;
            entryToUpdate.y = referenceNode.y ?? 0;
        } else if (targetNodeInfo?.entry.type === 'output') {
            const entryToUpdate = (book.povs as Record<string, Pov>)[targetNodeInfo.povId].entries[targetEntryId];
            entryToUpdate.x = (referenceNode.x ?? 0) + 300;
            entryToUpdate.y = referenceNode.y ?? 0;
        }
    }
    
    setBooks(updatedBooks);
    await localStore.set(BOOKS_KEY, updatedBooks);
  }, [books, localStore, BOOKS_KEY]);

  // --- Derived State ---
  const selectedBook = (selectedBookId && books) ? books[selectedBookId] : null;
  const selectedPov = (selectedBook && selectedPovId) ? selectedBook.povs[selectedPovId] : null;
  const selectedEntry = (selectedPov && selectedEntryId) ? selectedPov.entries[selectedEntryId] : null;
  
  const relationshipBook = (relationshipModalBookId && books) ? books[relationshipModalBookId] : null;

  const allEntriesInRelationshipBook = useMemo(() => {
    if (!relationshipBook) return [];
    const entriesList: { povId: string; povTitle: string; entryId: string; entryTitle: string }[] = [];
    // FIX: Explicitly typing the forEach callback parameters ensures that `pov` and `entry` are correctly typed, resolving an error where `pov.entries` was accessed on an `unknown` type.
    (Object.entries(relationshipBook.povs) as [string, Pov][]).forEach(([povId, pov]: [string, Pov]) => {
        (Object.entries(pov.entries) as [string, Entry][]).forEach(([entryId, entry]: [string, Entry]) => {
            const activeVersion = entry.versions[entry.activeVersionId];
            entriesList.push({
                povId,
                povTitle: pov.title || 'Untitled POV',
                entryId,
                entryTitle: activeVersion?.title || 'Untitled Entry'
            });
        });
    });
    return entriesList;
  }, [relationshipBook]);

  const singleBookGraphData = useMemo(() => {
    if (!selectedBook || !selectedBookId) return { nodes: [], links: [] };

// FIX: Add explicit types for pov and entry to avoid accessing properties on 'unknown'.
    const nodes: GraphNode[] = Object.entries(selectedBook.povs).flatMap(([povId, pov]: [string, Pov]) =>
        Object.values(pov.entries).map((entry: Entry) => ({
            id: entry.id,
            title: entry.versions[entry.activeVersionId]?.title || 'Untitled Entry',
            povId: povId,
            bookId: selectedBookId,
            type: entry.type || 'prose',
            content: entry.versions[entry.activeVersionId]?.content || '',
            x: entry.x,
            y: entry.y,
            inputs: entry.inputs || [],
            outputs: entry.outputs || [],
            dirty: entry.dirty,
        }))
    );
    const links = (selectedBook.relationships || []).map(rel => ({
        source: rel.sourceEntryId,
        target: rel.targetEntryId,
        ...rel
    }));
    return { nodes, links };
  }, [selectedBook, selectedBookId]);

  const allBooksGraphData = useMemo(() => {
      if (!books) return { nodes: [], links: [] };

      const allNodes: GraphNode[] = [];
      const allLinks: any[] = [];

// FIX: Add explicit types for book, pov, and entry to avoid accessing properties on 'unknown'.
      Object.entries(books).forEach(([bookId, book]: [string, Book]) => {
          // FIX: Explicitly cast the result of Object.entries to correctly type `pov` within the flatMap callback.
          // This resolves an issue where `pov` was being inferred as `unknown`, causing a downstream error when accessing `pov.entries`.
          const bookNodes = (Object.entries(book.povs) as [string, Pov][]).flatMap(([povId, pov]: [string, Pov]) =>
              Object.values(pov.entries).map((entry: Entry) => ({
                  id: entry.id,
                  title: entry.versions[entry.activeVersionId]?.title || 'Untitled Entry',
                  povId: povId,
                  bookId: bookId,
                  type: entry.type || 'prose',
                  content: entry.versions[entry.activeVersionId]?.content || '',
                  x: entry.x,
                  y: entry.y,
                  inputs: entry.inputs || [],
                  outputs: entry.outputs || [],
                  dirty: entry.dirty,
              }))
          );
          allNodes.push(...bookNodes);

          const bookLinks = (book.relationships || []).map(rel => ({
              ...rel,
              source: rel.sourceEntryId,
              target: rel.targetEntryId,
              bookId: bookId,
          }));
          allLinks.push(...bookLinks);
      });

      return { nodes: allNodes, links: allLinks };
  }, [books]);

  const renderContent = () => {
    if (conflict) {
        return <ConflictModal conflict={conflict} onResolve={resolveConflict} />;
    }
    switch (view) {
        case 'list':
            return <BookListView 
                        books={books} 
                        onSelectBook={handleSelectBook} 
                        onDeleteBook={(id, name) => handleDeleteRequest({ type: 'book', id, name })} 
                    />;
        case 'povList':
            return <PovListView 
                        povs={selectedBook?.povs ?? {}} 
                        onSelectPov={handleSelectPov} 
                        onDeletePov={(id, name) => handleDeleteRequest({ type: 'pov', id, name })} 
                    />;
        case 'graph':
            return <GraphView
                        nodes={singleBookGraphData.nodes}
                        links={singleBookGraphData.links}
                        onSelectEntry={handleSelectEntryFromGraph}
                        onEditRelationship={handleEditRelationship}
                        onDeleteEntry={(node) => handleDeleteRequest({ type: 'entry', id: node.id, name: node.title, context: { bookId: node.bookId } })}
                        onBackgroundClick={handleGraphBackgroundClick}
                        onGenerateIdeas={handleGenerateIdeas}
                        onRecomputeCode={handleRecomputeCode}
                        onRecomputeNL={handleRecomputeNL}
                        onNodePositionChange={handleNodePositionChange}
                        onNodeContentChange={handleNodeContentChange}
                        onAddRelationshipDirectly={(data) => handleAddRelationshipDirectly({ ...data, bookId: selectedBookId! })}
                        onAddSocket={handleAddSocket}
                        onUpdateSocketLabel={handleUpdateSocketLabel}
                        onAddSocketAndConnect={handleAddSocketAndConnect}
                        onUpdateInlinedValue={handleUpdateInlinedValue}
                        onToggleRelationshipInlined={handleToggleRelationshipInlined}
                    />;
        case 'globalGraph':
            return <GraphView
                        nodes={allBooksGraphData.nodes}
                        links={allBooksGraphData.links}
                        onSelectEntry={handleSelectEntryFromGraph}
                        onEditRelationship={handleEditRelationship}
                        onDeleteEntry={(node) => handleDeleteRequest({ type: 'entry', id: node.id, name: node.title, context: { bookId: node.bookId } })}
                        onBackgroundClick={handleGlobalGraphBackgroundClick}
                        onGenerateIdeas={handleGenerateIdeas}
                        onRecomputeCode={handleRecomputeCode}
                        onRecomputeNL={handleRecomputeNL}
                        onNodePositionChange={handleNodePositionChange}
                        onNodeContentChange={handleNodeContentChange}
                        onAddSocket={handleAddSocket}
                        onUpdateSocketLabel={handleUpdateSocketLabel}
                        onAddSocketAndConnect={handleAddSocketAndConnect}
                        onUpdateInlinedValue={handleUpdateInlinedValue}
                        onToggleRelationshipInlined={handleToggleRelationshipInlined}
                        onAddRelationshipDirectly={(data) => {
                            if (!books) return;
                            const { sourceEntryId, targetEntryId } = data;
                            let sourceBookId: string | null = null;
                            let targetBookId: string | null = null;

                            // FIX: Explicitly type `book` from Object.entries to ensure `pov` is correctly inferred as `Pov`, resolving errors on `pov.entries`.
                            for (const [bId, book] of Object.entries(books) as [string, Book][]) {
                                // FIX: Explicitly type `pov` as `Pov` to prevent it from being inferred as `unknown` when iterating over Object.values.
                                for (const pov of Object.values(book.povs) as Pov[]) {
                                    if (pov.entries[sourceEntryId]) sourceBookId = bId;
                                    if (pov.entries[targetEntryId]) targetBookId = bId;
                                }
                            }
                            if (sourceBookId && sourceBookId === targetBookId) {
                                handleAddRelationshipDirectly(data);
                            } else {
                                alert("Relationships can only be created between entries in the same book.");
                            }
                        }}
                    />;
        case 'entryList':
            return <EntryListView 
                        entries={selectedPov?.entries ?? {}}
                        onSelectEntry={handleSelectEntry}
                        onDeleteEntry={(id, name) => handleDeleteRequest({ type: 'entry', id, name })}
                    />;
        case 'editor':
            if (!selectedEntry || !selectedBook || !selectedBookId) return null;
            return <EditorView
                        selectedEntry={selectedEntry}
                        selectedBook={selectedBook}
                        selectedBookId={selectedBookId}
                        onTextChange={handleTextChange}
                        onSocketAdd={handleEntrySocketAdd}
                        onSocketChange={handleEntrySocketChange}
                        onSocketDelete={handleEntrySocketDelete}
                        onSelectEntry={handleSelectEntryFromGraph}
                        disabled={isLoading || conflict !== null}
                    />;
        default:
            return null;
    }
  };

  return (
    <div className="app-container">
      <Header
        view={view}
        books={books}
        selectedBookId={selectedBookId}
        selectedPovId={selectedPovId}
        selectedEntry={selectedEntry}
        tokenClient={tokenClient}
        accessToken={accessToken}
        isSynced={isSynced}
        bookTitleInputRef={bookTitleInputRef}
        povTitleInputRef={povTitleInputRef}
        entryTitleInputRef={entryTitleInputRef}
        onBack={handleBack}
        onNavigateToGraph={handleNavigateToGraph}
        onNavigateToPovList={handleNavigateToPovList}
        onNavigateToGlobalGraph={handleNavigateToGlobalGraph}
        onNavigateToList={handleNavigateToList}
        onEntryTitleChange={handleEntryTitleChange}
        onEntryTypeChange={handleEntryTypeChange}
        onBookTitleChange={handleBookTitleChange}
        onPovTitleChange={handlePovTitleChange}
        onAddNewBook={handleAddNewBook}
        onAddNewPov={handleAddNewPov}
        onAddNewEntry={() => handleAddNewEntry()}
        onOpenSaveVersionModal={() => setIsSavingVersionModalOpen(true)}
        onOpenVersionSelector={() => setIsVersionSelectorOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenRelationshipModal={handleOpenNewRelationshipModal}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onManualSync={handleManualSync}
      />

      <main className={`main-content ${view === 'editor' || view === 'graph' || view === 'globalGraph' ? 'editor-mode' : ''}`}>
        {isLoading && <div className="loading-overlay"><div className="spinner"></div></div>}
        {books !== null && renderContent()}
      </main>

      {isSavingVersionModalOpen && (
        <SaveVersionModal
            onClose={() => setIsSavingVersionModalOpen(false)}
            onSave={handleConfirmSaveNewVersion}
        />
      )}
      {isVersionSelectorOpen && selectedEntry && (
        <VersionSelectorModal
            entry={selectedEntry}
            activeVersionId={selectedEntry.activeVersionId}
            onClose={() => setIsVersionSelectorOpen(false)}
            onSelectVersion={handleSelectVersion}
            onDeleteVersion={handleDeleteVersion}
            onRenameVersion={handleRenameVersion}
        />
      )}
      {itemToDelete && (
        <ConfirmDeleteModal
            item={itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={confirmDelete}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
            onClose={() => setIsSettingsModalOpen(false)}
            onExport={() => setIsExportModalOpen(true)}
            onImport={handleImport}
            isPickerApiLoaded={isPickerApiLoaded}
            isLoading={isLoading}
        />
      )}
      {dataToImport && (
        <ConfirmImportModal
            onClose={() => setDataToImport(null)}
            onConfirm={confirmImport}
        />
      )}
      {isExportModalOpen && (
          <ExportModal
              onClose={() => setIsExportModalOpen(false)}
              onConfirm={handleConfirmExport}
          />
      )}
      {relationshipToEdit && relationshipBook && (
          <RelationshipModal
              relationship={relationshipToEdit}
              allEntries={allEntriesInRelationshipBook}
              onClose={handleCloseRelationshipModal}
              onSave={handleSaveRelationship}
              onDelete={handleDeleteRelationship}
          />
      )}

      {isSaving && accessToken && <div className="status-indicator">Saving...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);