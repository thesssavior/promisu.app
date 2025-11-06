export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 sm:text-7xl md:text-8xl">
              Acture
            </h1>
            <p className="mt-6 text-2xl leading-8 text-gray-600 sm:text-3xl">
              Change your life with actions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-500 max-w-2xl mx-auto">
              Set goals, track progress, and transform your habits into lasting change. 
              Powered by AI to help you find your why and stay committed.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#features"
                className="rounded-full bg-black px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                Learn More
              </a>
              <a
                href="#"
                className="text-base font-semibold leading-7 text-gray-900 hover:text-gray-700"
              >
                Coming Soon <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Built for real change
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Everything you need to turn intentions into actions
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {/* Goal Setting */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Set Goals & Actions
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Define clear, actionable goals with details like location, time, and duration. 
                    Create actions that fit your life and schedule.
                  </p>
                </dd>
              </div>

              {/* Progress Tracking */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  Track Your Progress
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Visualize your progress with GitHub-like grids and calendar views. 
                    See your streaks, track daily habits, and celebrate milestones.
                  </p>
                </dd>
              </div>

              {/* AI Assistance */}
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  AI-Powered Insights
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Discover your fundamental motives, visualize your future, and get personalized 
                    strategies to make your environment work for you.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Visual Progress Section */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Visual Progress Tracking
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              See your habits take shape over time
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* GitHub-like Grid */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Grid View</h3>
              <p className="text-gray-600 mb-6">
                A GitHub-contribution-style grid that shows your daily activity at a glance.
              </p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 100 }).map((_, i) => {
                  const intensity = Math.random();
                  const colorClass = 
                    intensity > 0.7 ? 'bg-green-500' :
                    intensity > 0.4 ? 'bg-green-300' :
                    intensity > 0.2 ? 'bg-green-100' :
                    'bg-gray-100';
                  return (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded ${colorClass}`}
                    />
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-green-500"></div>
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border-2 border-blue-500 bg-blue-500"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-gray-100 border border-gray-300"></div>
                  <span>No activity</span>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Calendar View</h3>
              <p className="text-gray-600 mb-6">
                Monthly calendar view with streak indicators and completion tracking.
              </p>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const isCompleted = i < 7 && Math.random() > 0.3;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                        isCompleted
                          ? 'bg-green-500 text-white font-semibold'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {i < 28 ? i + 1 : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              AI-Powered Guidance
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Coming soon: AI features to deepen your commitment
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-white p-8 border border-green-100">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Find Your Why
              </h3>
              <p className="text-gray-600">
                Discover the fundamental motive behind your goals. AI helps you uncover 
                what truly drives you and why this change matters.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-8 border border-blue-100">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Visualize Your Future
              </h3>
              <p className="text-gray-600">
                "What would your life be like in 3 years if you stick to this? What if you don't?" 
                AI paints vivid scenarios to strengthen your commitment.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-white p-8 border border-purple-100">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Environment & Support
              </h3>
              <p className="text-gray-600">
                Get personalized strategies on how to shape your environment and leverage 
                the people around you to support your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Features */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Available Now
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Start tracking your habits today
            </p>
          </div>

          <div className="mt-16 rounded-2xl bg-white p-8 shadow-lg max-w-4xl mx-auto">
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span><strong>Daily Habits Dashboard</strong> - Track multiple habits in one place with visual progress indicators</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span><strong>GitHub-like Grid View</strong> - See your activity patterns across months at a glance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span><strong>Calendar View</strong> - Monthly calendar with completion tracking and streak visualization</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span><strong>Streak Tracking</strong> - Monitor your current and longest streaks for each habit</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold text-xl">✓</span>
                <span><strong>Action Management</strong> - Create, edit, and customize actions with details like location and time</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to change your life?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Start tracking your habits today. More features coming soon as we iterate and improve.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-black shadow-sm hover:bg-gray-100 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <p className="text-sm leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} Acture. Built for fast iteration and real change.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
