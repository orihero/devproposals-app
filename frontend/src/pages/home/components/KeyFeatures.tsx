

const features = [
  {
    icon: '📝',
    title: 'Define Requirements That Get Results',
    desc: 'Upload your PRD or project requirements and let our system guide you through creating comprehensive project profiles. Clear requirements lead to better proposals and more accurate analysis.'
  },
  {
    icon: '🤖',
    title: 'Objective Analysis in Minutes',
    desc: 'Our advanced AI reads through proposals, extracts key metrics, and evaluates alignment with your requirements. Get detailed analysis including cost breakdowns, timeline assessment, and feature coverage evaluation.'
  },
  {
    icon: '📊',
    title: 'Side-by-Side Proposal Comparison',
    desc: 'View all proposals in standardized comparison tables that highlight differences in cost, timeline, approach, and deliverables. Make informed decisions based on data, not presentation skills.'
  },
  {
    icon: '💡',
    title: 'AI-Generated Questions & Suggestions',
    desc: 'Receive specific questions to ask each vendor, potential concerns to address, and recommendations based on your project priorities and risk tolerance.'
  },
  {
    icon: '🔒',
    title: 'Enterprise-Grade Security',
    desc: 'All proposals and project information are encrypted and access-controlled. Maintain confidentiality while enabling collaborative decision-making with your team.'
  },
  {
    icon: '📁',
    title: 'Complete Project Visibility',
    desc: 'Track all projects, proposals, and decisions in one centralized dashboard. Perfect for agencies and enterprises managing multiple development projects.'
  },
];

const KeyFeatures = () => (
  <section id="features" className="max-w-6xl mx-auto py-16 px-8">
    <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-10 text-center">Everything You Need for Smarter Proposal Decisions</h2>
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      {features.map((f, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-start">
          <div className="text-3xl mb-4">{f.icon}</div>
          <h3 className="text-xl font-bold text-violet-800 mb-2">{f.title}</h3>
          <p className="text-gray-700 text-base">{f.desc}</p>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-center">
      {/* Placeholder for interactive demo or screenshot */}
      <div className="w-96 h-64 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl flex items-center justify-center text-violet-400 text-lg font-medium">[Feature Demo/Screenshot]</div>
    </div>
  </section>
);

export default KeyFeatures; 