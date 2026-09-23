export type Job = {
  dates: string
  role: string
  organisation: string
  description: string
  stack: string
  more?: { label: string; items: readonly string[] }
}

// From resume_ats (2026-09-18). Printed by the CV only.
export const experience: readonly Job[] = [
  {
    dates: 'September 2025 — July 2026',
    role: 'Teaching Tutor · Operating Systems',
    organisation: 'University of Bologna',
    description:
      'Provisioned a local Moodle stack with Docker for offline course testing and wrote the OFA question bank, with a difficulty level and a category per question.',
    stack: 'Docker, MariaDB, Moodle'
  },
  {
    dates: 'June 2021 — June 2023',
    role: 'Full-Stack Developer',
    organisation: 'Docenti.it',
    description:
      'Developed the back end of a predictive engine for national teacher rankings (Aggiornamento Graduatorie) that became the engine of paid services such as InCattedra: it calculates scores under ministerial guidelines and estimates next year’s position from historical rankings.',
    stack:
      'Java, Java EE, Hibernate, Spring MVC, JAX-RS, MariaDB, JSF, PrimeFaces, GWT; Nginx and Apache',
    more: {
      label: 'CRM, checkout, IoMiLaureo and mentoring',
      items: [
        'Co-managed the CRM back end: brought a ticketing prototype into use, redesigned checkout with payment APIs and built the students’ exam calendar.',
        'Developed IoMiLaureo and redesigned the public website’s REST APIs; helped migrate the CRM, introduced shared team planning and mentored my successors.'
      ]
    }
  },
  {
    dates: 'September 2020 — June 2021',
    role: 'Full-Stack Developer Intern',
    organisation: 'Docenti.it',
    description:
      'Developed an algorithm that routes requests to tutors automatically, balancing the load by a weighted percentage; CRM modules, server-side development and bug fixing.',
    stack: 'Java EE, Hibernate, Spring MVC, JSF, MariaDB, GWT, JavaScript'
  },
  {
    dates: 'September 2016 — June 2018',
    role: 'System & Network Administrator',
    organisation: 'GC Group Srl',
    description:
      'Configured and managed servers, workstations and network infrastructure; OS deployment, network monitoring and remote maintenance. On-site and remote IT support.',
    stack: 'Windows Server, Hyper-V, remote administration tooling'
  }
]
