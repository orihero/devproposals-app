

const SolutionOverview = () => (
  <section id="solution" className="max-w-6xl mx-auto py-16 px-8">
    <div className="flex flex-col md:flex-row gap-10 items-center">
      <div className="flex-1">
        <h2 className="text-3xl md:text-4xl font-extrabold text-violet-900 mb-4">AI-Powered Proposal Intelligence That Actually Works</h2>
        <p className="text-lg text-gray-700 mb-6">
          DevProposals.com transforms chaotic proposal evaluation into a streamlined, objective process. Our AI engine reads through every proposal, extracts key information, and provides comprehensive analysis that highlights the best fit for your specific project needs.
        </p>
        <ul className="mb-6 space-y-3">
          <li><span className="text-violet-700 font-bold">Intelligent Analysis:</span> Our AI doesn't just scan documents—it understands context, identifies gaps, and evaluates proposal quality against your specific requirements with 95% accuracy.</li>
          <li><span className="text-violet-700 font-bold">Objective Comparison:</span> Get standardized metrics for every proposal including cost breakdowns, timeline feasibility, feature coverage, and implementation approach comparisons.</li>
          <li><span className="text-violet-700 font-bold">Actionable Insights:</span> Receive specific questions to ask vendors, potential risk factors to consider, and recommendations based on your project priorities and constraints.</li>
          <li><span className="text-violet-700 font-bold">Time Savings:</span> Reduce proposal evaluation time from weeks to hours while improving decision accuracy and project outcomes.</li>
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {/* Placeholder for visual demonstration of AI analysis */}
        <div className="w-72 h-56 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl flex items-center justify-center text-violet-400 text-lg font-medium">[AI Analysis Visual]</div>
      </div>
    </div>
  </section>
);

export default SolutionOverview; 