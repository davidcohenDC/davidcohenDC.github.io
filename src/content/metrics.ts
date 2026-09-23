// The figure each project is remembered by, and what it counts: David's own
// claims, signed in the CV. They live apart from the rest of the CV because
// the portfolio prints them too, and importing content/cv.ts for five figures
// put every sentence of the CV in the page's JavaScript — 1.5 KB of budget.
import type { Metric } from '@/domain/project'

// Keyed by the repository's full name (content/sources.ts).
export const metrics: Record<string, Metric> = {
  'Scala-Robotics-Simulator/scala-robotics-simulator': {
    value: '43M → 32',
    label: 'states after redesigning the RL observation space',
    short: 'RL states, after redesign'
  },
  'davidcohenDC/lecturize': {
    value: '7× / 20×',
    label:
      'faster than real time on my laptop, CPU then GPU, with the small model',
    short: 'faster than real time, CPU / GPU'
  },
  'davidcohenDC/python-clean-architecture-template': {
    value: '9 / 9',
    label: 'guarantees the build checks, each traced to a decision record',
    short: 'guarantees checked by the build'
  },
  'davidcohenDC/s-parking': {
    value: '7 / 24',
    label:
      'successful parks in a simulated evaluation; 17 safety stops, 0 collisions',
    short: 'simulated parks, 0 collisions'
  },
  'davidcohenDC/argos-swarm-robotics': {
    value: '81',
    label:
      'parameter combinations swept; the best set holds neighbours 27 cm apart',
    short: 'parameter sets swept'
  }
}
