

const testimonials = [
  {
    quote: 'DevProposals.com helped us identify the perfect development partner in half the time it usually takes. The AI analysis caught important details we would have missed in manual review, and our project exceeded expectations because of the better initial match.',
    name: 'Sarah Chen',
    title: 'CTO at TechStart Inc.'
  },
  {
    quote: 'As a development agency, we love how DevProposals.com creates fair evaluation processes. Our proposals are judged on technical merit rather than flashy presentations, which has helped us win more projects that align with our expertise.',
    name: 'Marcus Rodriguez',
    title: 'Founder of CodeCraft Solutions'
  },
  {
    quote: 'The objective comparison tools gave us confidence in our vendor selection decision. We saved weeks of back-and-forth evaluation and ended up with a development partner who delivered exactly what we needed, on time and on budget.',
    name: 'Jennifer Park',
    title: 'Product Manager at InnovateCorp'
  },
];

const metrics = [
  { label: 'Proposal Analysis Accuracy', value: '95%' },
  { label: 'Reduction in Evaluation Time', value: '80%' },
  { label: 'Client Satisfaction Rate', value: '92%' },
  { label: 'Successful Project Matches', value: '500+' },
];

const SocialProof = () => (
  <section id="social-proof" className="max-w-6xl mx-auto py-16 px-8">
    <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-10 text-center">Trusted by Forward-Thinking Companies</h2>
    {/* Placeholder for company logos */}
    <div className="flex flex-wrap justify-center gap-8 mb-10">
      <div className="w-28 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">[Logo]</div>
      <div className="w-28 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">[Logo]</div>
      <div className="w-28 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">[Logo]</div>
      <div className="w-28 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">[Logo]</div>
    </div>
    <div className="grid md:grid-cols-3 gap-8 mb-12">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-start">
          <div className="text-gray-600 italic mb-4">"{t.quote}"</div>
          <div className="font-bold text-violet-800">{t.name}</div>
          <div className="text-gray-500 text-sm">{t.title}</div>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap justify-center gap-8">
      {metrics.map((m, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="text-2xl font-bold text-violet-700">{m.value}</div>
          <div className="text-gray-700 text-sm text-center">{m.label}</div>
        </div>
      ))}
    </div>
  </section>
);

export default SocialProof; 