import {
  Bot,
  Boxes,
  BrainCircuit,
  Car,
  Code2,
  FileAudio,
  Network,
  Server,
  type LucideIcon
} from 'lucide-react'

// In priority order: the first pattern any topic matches wins. A new kind of
// work is one line here, never a per-project entry.
const TOPIC_ICONS: [RegExp, LucideIcon][] = [
  [/swarm|multi-agent/, Boxes],
  [/robot/, Bot],
  [/autonomous|vehicle|driving|carla/, Car],
  [/speech|audio|transcription|whisper/, FileAudio],
  [/architecture|ddd|hexagonal/, Network],
  [/distributed|microservice/, Server],
  [/machine-learning|deep-learning|reinforcement/, BrainCircuit]
]

export function topicIcon(topics: readonly string[]): LucideIcon {
  const match = TOPIC_ICONS.find(([pattern]) =>
    topics.some((topic) => pattern.test(topic))
  )
  return match ? match[1] : Code2
}
