import { readFileSync, writeFileSync } from 'node:fs'
import type { Snapshot } from '@/domain/snapshot'
import type { SnapshotStore } from '../ports'

export function createSnapshotFile(path: string): SnapshotStore {
  return {
    read() {
      try {
        return JSON.parse(readFileSync(path, 'utf8')) as Snapshot
      } catch {
        return null
      }
    },
    write(snapshot) {
      writeFileSync(path, `${JSON.stringify(snapshot, null, 2)}\n`)
    }
  }
}
