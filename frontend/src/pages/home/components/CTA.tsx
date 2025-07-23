

const CTA = () => (
  <section id="cta" className="max-w-4xl mx-auto py-16 px-8 text-center">
    <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-6">Ready to Transform Your Proposal Evaluation Process?</h2>
    <p className="text-lg text-gray-700 mb-8">
      Join hundreds of companies who have streamlined their vendor selection process with AI-powered proposal analysis. Make better decisions faster, reduce project risk, and find the perfect development partners for your projects.
    </p>
    <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
      <button className="bg-violet-700 text-white font-semibold px-8 py-4 rounded hover:bg-violet-900 transition">Start Your First Analysis Free</button>
      <button className="bg-transparent border-2 border-violet-700 text-violet-700 font-semibold px-8 py-4 rounded hover:bg-violet-50 transition">Schedule a Demo</button>
      <button className="bg-transparent border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded hover:bg-gray-50 transition">Contact Sales Team</button>
    </div>
    <div className="text-gray-600 mb-4">Try DevProposals.com free for 14 days. No credit card required. Cancel anytime.</div>
    <div className="text-gray-700 text-sm">
      Questions? Contact our team at <a href="mailto:hello@devproposals.com" className="text-violet-700 underline">hello@devproposals.com</a> or schedule a personalized demo.
    </div>
  </section>
);

export default CTA; 