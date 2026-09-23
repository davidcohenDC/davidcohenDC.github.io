// What only the CV says: claims about David's own work, which no API holds.
// The portfolio page prints none of this; it prints only the figures in
// content/metrics.ts.

// The figure that goes with each claim is in content/metrics.ts, which the
// portfolio reads as well.
export type ProjectClaim = {
  contribution: string
  decisions: readonly string[]
}

// Keyed by the repository's full name (content/sources.ts).
export const projectClaims: Record<string, ProjectClaim> = {
  'Scala-Robotics-Simulator/scala-robotics-simulator': {
    contribution:
      'In a team of three I designed the behaviour DSL and the domain validation model, built the illumination engine and the simulation GUI, and did the phototaxis learning task.',
    decisions: [
      'Compose partial robot behaviours with Kleisli arrows, then close the chain with a fallback policy.',
      'Reduce an intractable Q-table to 32 states: the best checkpoint reached 90% success on ten held-out environments.',
      'Train a DQN on 10×10 arenas and evaluate on 5×5, 20×20 and 30×30 arenas: 86%, 95% and 100% success respectively on curated environments with different step budgets.'
    ]
  },
  'davidcohenDC/lecturize': {
    contribution:
      'Mine, published on PyPI: design, implementation, packaging and releases. It replaces a single-file script I had been using for my own lectures.',
    decisions: [
      'Drop PyTorch entirely and run CTranslate2: one install of about 300 MB, and the CUDA libraries only for whoever asks for them.',
      'Save every utterance to a SQLite checkpoint keyed by the file fingerprint and the settings, so an interrupted two-hour run continues from the last sentence.',
      'Translate with the Argos Translate model packages driven directly through CTranslate2, pivoting through English, instead of a second ML runtime.'
    ]
  },
  'davidcohenDC/python-clean-architecture-template': {
    contribution:
      'Mine: the guarantee registry, the architecture tests behind it, the example domain and the documentation.',
    decisions: [
      'Each guarantee names the tests that would falsify it; one with no evidence is reported as missing, so the command cannot be green by default.',
      'The dependency-rule checker is itself tested against thirteen synthetic violations.',
      "One command strips the example domain and the template's own checks, and a test proves what is left still lints, migrates and serves."
    ]
  },
  'davidcohenDC/s-parking': {
    contribution: 'Two-person project. I authored the implementation.',
    decisions: [
      'Give obstacle detection priority over manoeuvre completion through an immediate stop transition.',
      'Evaluate geometry, lateral offset and weather: 7 successful parks, 17 safety stops, zero collisions.',
      'Use an explicit rule-based controller. The evaluation is simulation-only; recovery from an interrupted manoeuvre remains a limitation.'
    ]
  },
  'davidcohenDC/argos-swarm-robotics': {
    contribution:
      'Alone, for the course: the four controllers, the headless experiment scripts and the parameter study behind them.',
    decisions: [
      'Solve the same task three times over, with fixed priorities, with subsumption layers and with motor schemas summed as vectors, and compare what each architecture costs.',
      'Aggregate with a WALK/STOP automaton on ten-byte line-of-sight messages: stop with probability min(PsMax, S + α·N) in the number of stopped neighbours heard.',
      'Five hundred and three hundred headless runs with a Mann-Whitney test on the seeds; small parameter changes move the result a lot, and the report says so.'
    ]
  }
}

export type PaperClaim = { credit: string; contribution: string }

// Keyed by DOI.
export const paperClaims: Record<string, PaperClaim> = {
  '10.1016/j.neunet.2025.108249': {
    credit:
      'Credited for software, investigation, data curation, formal analysis and validation.',
    contribution:
      'Built the Python experimental pipeline with HuggingFace and PyTorch, ran experiments on SLURM and processed results. The study compares five language models, six datasets and more than 3,500 configurations, scored with ten automatic metrics alongside human assessment, latency and carbon footprint.'
  }
}

export const skills = [
  {
    title: 'Programming languages',
    items:
      'Scala 3, Java, Python, Kotlin, JavaScript and TypeScript, C++ (embedded, Arduino and ESP).'
  },
  {
    title: 'Research and ML',
    items:
      'Q-learning, Deep Q-Networks, reward engineering, experimental design, natural language processing, PyTorch, HuggingFace, TensorFlow and Keras.'
  },
  {
    title: 'Concurrency and distribution',
    items:
      'Akka Typed, cats-effect, gRPC, Protobuf, Java RMI, MQTT, AMQP, RabbitMQ, microservices.'
  },
  {
    title: 'Architecture',
    items:
      'Hexagonal architecture, CQRS, ports and adapters, domain-driven design; boundaries enforced in CI.'
  },
  {
    title: 'Back end and data',
    items:
      'REST, OpenAPI, Spring MVC, Hibernate, Java EE, Node.js, MariaDB, MongoDB, Apache Spark on AWS EMR.'
  },
  {
    title: 'Practices and tooling',
    items:
      'Docker, Git, GitHub Actions CI/CD, static analysis, coverage, BDD, TDD, Agile and Scrum.'
  }
]

export const languages =
  'Italian: native. English: fluent. Greek: fluent spoken (self-reported).'

// The CV prints this under a "Certification" label, so the line does not
// repeat the word.
export const certification = 'Microsoft Server, GC Group Srl, June 2017.'
