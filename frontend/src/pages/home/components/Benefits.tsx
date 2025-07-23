

const benefits = [
  {
    title: 'Save 80% of Evaluation Time',
    desc: 'Reduce proposal review from weeks to hours with automated analysis and comparison',
  },
  {
    title: 'Improve Decision Accuracy',
    desc: 'Objective scoring eliminates guesswork and reduces the risk of poor vendor selection',
  },
  {
    title: 'Identify Hidden Issues',
    desc: 'AI analysis catches potential problems and gaps that manual review often misses',
  },
  {
    title: 'Ask Better Questions',
    desc: 'Get specific, relevant questions to ask each vendor based on their proposal analysis',
  },
  {
    title: 'Reduce Project Risk',
    desc: 'Better initial vendor selection leads to more successful project outcomes and fewer surprises',
  },
];

const Benefits = () => (
  <section id="benefits" className="max-w-3xl mx-auto py-16 px-8">
    <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-8 text-center">Built for Project Owners to Make Confident Decisions</h2>
    <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-violet-800 mb-6 text-center">Make Confident Vendor Selection Decisions</h3>
      <ul className="space-y-5">
        {benefits.map((b, i) => (
          <li key={i} className="flex flex-col items-start">
            <span className="font-bold text-violet-700">{b.title}</span>
            <span className="text-gray-700">{b.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Benefits; 