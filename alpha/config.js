/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Configuration file for application-level constants. It exports the Google Client ID
 * required for Google Sign-In and Google Drive API access, and the Google API Key
 * for accessing public Google APIs like the Picker API.
 *
 * IMPORTANT: The placeholder values must be replaced with valid credentials obtained
 * from the Google Cloud Console for the application to function correctly.
 */

// --- CONFIGURATION ---

// IMPORTANT: You must replace this placeholder value with your own Google Client ID.
// This is used for the OAuth 2.0 flow to get user permission.
// Go to Google Cloud Console > APIs & Services > Credentials to create one.
export const GOOGLE_CLIENT_ID = '594109471805-ru20g1u51eh5qbq9e0mbc8vu5fqcean3.apps.googleusercontent.com';

// IMPORTANT: You must replace this placeholder with your own Google API Key.
// This is used to authorize your application with the Google Picker API.
// Go to Google Cloud Console > APIs & Services > Credentials to create a new
// API Key. Make sure to restrict it to your website's domain and enable the
// "Google Picker API" in the API library for your project.
export const GOOGLE_API_KEY = 'AIzaSyAQ6PxFUXWtbrfySIbHyiOnccMPUb5_kaE';