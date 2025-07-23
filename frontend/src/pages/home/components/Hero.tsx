

const Hero = () => (
  <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-8 pt-4 pb-20">
    {/* Left: Text Content */}
    <div className="flex-1 flex flex-col items-start">
      {/* Badge */}
      <div className="flex items-center mb-6">
        <span className="inline-flex items-center bg-white shadow px-4 py-2 rounded-full text-sm font-semibold text-violet-700 gap-2 border border-gray-100">
          <span className="bg-violet-100 text-violet-700 rounded-full p-1"><svg width='18' height='18' fill='none' viewBox='0 0 24 24'><path fill='currentColor' d='M12 2a1 1 0 0 1 .894.553l2.382 4.83 5.334.775a1 1 0 0 1 .554 1.707l-3.858 3.762.911 5.312a1 1 0 0 1-1.451 1.054L12 17.347l-4.768 2.506a1 1 0 0 1-1.451-1.054l.911-5.312-3.858-3.762a1 1 0 0 1 .554-1.707l5.334-.775L11.106 2.553A1 1 0 0 1 12 2Z'/></svg></span>
          Number 1 Platform
        </span>
      </div>
      {/* Headline */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight" style={{letterSpacing: '-0.03em'}}>Transform Proposal Evaluation with AI-Powered Analysis</h1>
      {/* Subheadline/Description */}
      <p className="text-lg text-gray-500 mb-10 max-w-xl">
        DevProposals.com uses advanced AI to analyze development proposals against your project requirements, providing objective comparison scores and actionable insights that help you make confident decisions in minutes, not days.
      </p>
      {/* CTAs */}
      <div className="flex gap-4">
        <button className="bg-violet-700 text-white font-semibold px-8 py-4 rounded-2xl shadow hover:bg-violet-900 transition text-lg">Get Started Free</button>
        <button className="border-2 border-violet-100 text-violet-700 font-semibold px-8 py-4 rounded-2xl bg-white hover:bg-violet-50 transition text-lg">Learn more</button>
      </div>
    </div>
    {/* Right: Statistics Cards */}
    <div className="flex-1 flex flex-col gap-6 items-end mt-12 md:mt-0">
      {/* Avatars Card */}
      <div className="bg-white rounded-2xl shadow-lg px-6 py-3 flex items-center gap-2 min-w-[180px] mb-2 border border-gray-100">
        <div className="flex -space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
        </div>
        <span className="ml-2 text-violet-700 font-bold">✓</span>
      </div>
      {/* Performance Card */}
      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 w-80 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700">Performance</span>
          <span className="text-xs text-gray-400">Last month</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-gray-500">Total New Interviews</span>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"></div>
            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-violet-700">80</span>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Growth</span>
            <span className="text-lg font-semibold text-violet-700">8.20%</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-violet-700 text-white rounded-xl py-2 font-semibold hover:bg-violet-900 transition">View all</button>
      </div>
      {/* Offered Card */}
      <div className="bg-white rounded-2xl shadow-lg px-6 py-4 w-80 border border-gray-100 flex flex-col gap-2">
        <span className="font-semibold text-gray-700 mb-2">Offered</span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          <div>
            <div className="font-bold text-gray-800">Sandra Elliot</div>
            <div className="text-xs text-gray-500">London, UK</div>
          </div>
          <span className="ml-auto text-violet-700"><svg width='18' height='18' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#E0E7FF'/><path d='M9 12l2 2 4-4' stroke='#7C3AED' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/></svg></span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          <div>
            <div className="font-bold text-gray-800">Sandra Elliot</div>
            <div className="text-xs text-gray-500">London, UK</div>
          </div>
          <span className="ml-auto text-violet-700"><svg width='18' height='18' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='#E0E7FF'/><path d='M9 12l2 2 4-4' stroke='#7C3AED' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/></svg></span>
        </div>
      </div>
      {/* Download Card */}
      <div className="bg-lime-100 rounded-2xl shadow-lg px-6 py-4 w-80 border border-gray-100 flex flex-col gap-2">
        <span className="font-semibold text-gray-700 mb-2">Total Download</span>
        <span className="text-2xl font-bold text-lime-700 mb-1">1.2m</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">Download</span>
          <svg width='18' height='18' fill='none' viewBox='0 0 24 24'><path d='M12 4v12m0 0l-4-4m4 4l4-4' stroke='#7C3AED' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/><rect x='4' y='18' width='16' height='2' rx='1' fill='#7C3AED'/></svg>
        </div>
      </div>
    </div>
  </section>
);

export default Hero; 