import { Github, ExternalLink } from 'lucide-react'

const CONCEPTS = [
  { label: 'REST API Design',        detail: 'FastAPI + Pydantic v2' },
  { label: 'Async Programming',      detail: 'httpx, async/await' },
  { label: 'Caching Strategies',     detail: 'Redis TTL, cache keys' },
  { label: 'External API Integration', detail: 'OpenWeatherMap' },
  { label: 'Geospatial Calculation', detail: 'Haversine formula' },
  { label: 'Component Architecture', detail: 'React, hooks, props' },
  { label: 'Test-Driven Design',     detail: '58 pytest cases' },
  { label: 'Docker & Deployment',    detail: 'Containers, Render' },
]

const AboutSection = () => (
  <div className="animate-slide-up max-w-3xl">
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text)' }}>About</h2>
      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Background and motivation behind the project.
      </p>
    </div>

    <div className="flex flex-col gap-5">
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Why I built this</h3>
        <div className="flex flex-col gap-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          <p>
            I built this project to understand how food delivery platforms estimate arrival times, something I had always wondered about when using apps like Swiggy or Uber Eats. The estimate shown to users is not just distance — it is a combination of several variables that change in real time.
          </p>
          <p>
            The goal was to build something that actually models that complexity: distance via the Haversine formula, traffic multipliers, kitchen workload, peak hour delays, and live weather conditions fetched from the OpenWeatherMap API. It is not perfectly accurate in the way a production system would be, but it reflects how these systems think about the problem.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>What I learned</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONCEPTS.map(({ label, detail }) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ backgroundColor: 'var(--color-border-sub)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-sub)' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>What I would improve</h3>
        <ul className="flex flex-col gap-2">
          {[
            'Replace the Haversine straight-line distance with actual road-network routing using OSRM or GraphHopper — the current model underestimates travel time in cities.',
            'Add a PostgreSQL database to store historical ETA requests and compare estimated vs. actual delivery times over time.',
            'Build a live tracking simulation where a driver marker moves along the route at a calculated speed.',
            'Replace the static weather delay lookup with a model trained on historical weather and delivery time data.',
          ].map((item) => (
            <li key={item} className="flex gap-2.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--color-border-sub)', border: '1px solid var(--color-border)' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Durgam Poojitha</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Computer Science · Portfolio Project · Foodhub Engineering
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="https://github.com/DurgamPoojitha/food-delivery-eta-estimator"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs"
          >
            <Github size={13} /> GitHub
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs"
          >
            <ExternalLink size={13} /> API Docs
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default AboutSection
