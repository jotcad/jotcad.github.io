/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Provides a key-value store abstraction over the Google Drive API, specifically for
 * managing a single JSON file in the user's hidden App Data folder. This service handles
 * file discovery, creation, reading, and writing, abstracting away the complexities of
 * the Google Drive REST API.
 */

import { VersionedData } from '../types/types.ts';

/**
 * A key-value store that uses a single JSON file in Google Drive's App Data folder.
 */
export class GoogleDriveKVStore {
  private file: { id: string, headRevisionId: string | null } | null = null;
  private token: string;
  private cache: Record<string, any> | null = null;

  constructor(token: string) {
    this.token = token;
  }

  public async apiRequest(
    path: string,
    method: 'GET' | 'POST' | 'PATCH',
    body?: any
  ): Promise<any> {
    const headers = new Headers({
      'Authorization': `Bearer ${this.token}`,
    });
    let processedBody: string | undefined = undefined;

    if (body) {
        headers.append('Content-Type', 'application/json');
        processedBody = JSON.stringify(body);
    }

    const response = await fetch(
      `https://www.googleapis.com/${path}`, {
        method,
        headers,
        body: processedBody,
      }
    );

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { error: { message: `API request failed with status ${response.status}: ${response.statusText}` } };
        }
        console.error('Google Drive API Error:', errorData);
        if (response.status === 401) {
            throw new Error('Your session has expired. Please sign in again.');
        }
        throw new Error(errorData.error.message || 'An API error occurred.');
    }

    if (response.status === 204) return {};
    
    const responseText = await response.text();

    try {
      if (responseText.trim() === '') {
          return {};
      }
      return JSON.parse(responseText);
    } catch (e) {
      console.error(`[DEBUG] Failed to parse response from Drive API as JSON. Path: "${path}". Raw text was:`, responseText, e);
      if (path.includes('alt=media')) {
          return {}; 
      }
      throw new Error(`Received invalid JSON from Google Drive API for request: ${path}`);
    }
  }

  private async findFile(): Promise<{ id: string, headRevisionId: string | null } | null> {
    if (this.file) return this.file;
    const data = await this.apiRequest(
        "drive/v3/files?q=name='synced-notepad.json' and trashed=false&spaces=appDataFolder&fields=files(id,name,headRevisionId)",
        'GET'
    );
    if (data.files && data.files.length > 0) {
        this.file = data.files[0];
        return this.file;
    }
    return null;
  }

  private async createFile(): Promise<{ id: string, headRevisionId: string | null }> {
    const metadata = {
      name: 'synced-notepad.json',
      parents: ['appDataFolder'],
      'mimeType': 'application/json',
    };
    const fileMetadata = await this.apiRequest('drive/v3/files?fields=id,headRevisionId', 'POST', metadata);
    this.file = await this.writeFile(fileMetadata.id, { books: {} });
    return this.file!;
  }

  private async readFile(fileId: string): Promise<Record<string, any>> {
    if (this.cache) return this.cache;
    try {
      const data = await this.apiRequest(`drive/v3/files/${fileId}?alt=media`, 'GET');
      this.cache = data || {};
      return this.cache as Record<string, any>;
    } catch (error: any) {
      if (error.message.includes('404')) return {};
      throw error;
    }
  }

  private async writeFile(fileId: string, content: Record<string, any>): Promise<{ id: string, headRevisionId: string | null }> {
    this.cache = content;
    const path = `upload/drive/v3/files/${fileId}?uploadType=media&fields=id,headRevisionId`;
    return this.apiRequest(path, 'PATCH', content);
  }

  async getContentAndRevision<T>(key: string, defaultValue: T): Promise<VersionedData<T>> {
    let file = await this.findFile();
    if (!file) {
      return { value: defaultValue, revisionId: null };
    }
    const content = await this.readFile(file.id);
    return { value: content[key] ?? defaultValue, revisionId: file.headRevisionId };
  }

  async set<T>(key: string, value: T): Promise<{ id: string, headRevisionId: string | null }> {
    let file = await this.findFile();
    if (!file) {
      file = await this.createFile();
    }
    const content = await this.readFile(file.id);
    content[key] = value;
    const updatedFile = await this.writeFile(file.id, content);
    this.file = updatedFile;
    return updatedFile;
  }
}
