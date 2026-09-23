import type { Snapshot } from '@/domain/snapshot'
import json from './snapshot.json'

// Written by `npm run sync`, never by hand.
export const snapshot = json as Snapshot

export const syncedAt = snapshot.fetched
