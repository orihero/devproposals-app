

const commitments = [
  {
    title: 'Data Encryption',
    desc: 'All proposals and project information are encrypted in transit and at rest using industry-standard AES-256 encryption',
  },
  {
    title: 'Access Controls',
    desc: 'Strict role-based access ensures only authorized team members can view sensitive proposal information',
  },
  {
    title: 'Confidentiality Protection',
    desc: 'Proposals remain confidential to project stakeholders—developers cannot see competing submissions',
  },
  {
    title: 'Compliance Ready',
    desc: 'Built with SOC 2 Type II compliance standards and GDPR data protection requirements',
  },
  {
    title: 'Secure Infrastructure',
    desc: 'Hosted on enterprise-grade cloud infrastructure with 99.9% uptime guarantee and regular security audits',
  },
];

const badges = [
  { label: 'SSL', icon: '🔒' },
  { label: 'SOC 2', icon: '📄' },
  { label: 'GDPR', icon: '🇪🇺' },
  { label: 'Enterprise Security', icon: '🏢' },
];

const Security = () => (
  <section id="security" className="max-w-6xl mx-auto py-16 px-8">
    <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-10 text-center">Enterprise-Grade Security You Can Trust</h2>
    <ul className="mb-10 space-y-5 max-w-3xl mx-auto">
      {commitments.map((c, i) => (
        <li key={i} className="flex flex-col items-start bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <span className="font-bold text-violet-700 mb-1">{c.title}</span>
          <span className="text-gray-700">{c.desc}</span>
        </li>
      ))}
    </ul>
    <div className="flex flex-wrap justify-center gap-8">
      {badges.map((b, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="text-3xl mb-2">{b.icon}</div>
          <div className="text-gray-700 text-sm font-semibold">{b.label}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Security; 