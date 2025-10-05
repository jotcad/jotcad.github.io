/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * @fileoverview
 * Type definitions specific to the GraphView and its sub-components.
 */

export type SocketPosition = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type SocketSide = 'top' | 'right' | 'bottom' | 'left';
export type SocketInfo = { label: string; type: 'input' | 'output'; };
