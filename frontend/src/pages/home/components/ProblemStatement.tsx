import React from 'react';
import { Icon } from '@iconify/react';

const processSteps = [
  {
    title: 'Time Drain',
    description: 'Project managers spend 15-20 hours per project manually reviewing and comparing proposals',
    icon: 'mdi:clock-outline',
    position: 'top-left',
  },
  {
    title: 'Inconsistent Evaluation',
    description: 'Without standardized criteria, proposal comparison becomes subjective and unreliable',
    icon: 'mdi:scale-balance',
    position: 'top-right',
  },
  {
    title: 'Missing Details',
    description: 'Important technical requirements and red flags often get overlooked in lengthy proposal documents',
    icon: 'mdi:alert-circle-outline',
    position: 'bottom-left',
  },
  {
    title: 'Decision Paralysis',
    description: 'Too many variables and no clear comparison framework leads to delayed decisions and missed opportunities',
    icon: 'mdi:help-circle-outline',
    position: 'bottom-right',
  },
];

const ProblemStatement = () => (
  <section id="problem" className="bg-gray-900 py-16 px-8">
    <div className="max-w-5xl mx-auto">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8">
        <div className="flex-1 relative">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">The Hidden Cost of Manual Proposal Review</h2>
          <div className="absolute -top-2 -right-2 bg-lime-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold transform rotate-12">Process</div>
        </div>
        <div className="flex-1 md:ml-8 mt-4 md:mt-0">
          <p className="text-gray-300 text-base">
            Evaluating development proposals shouldn't feel like guesswork. Traditional manual review processes are time-consuming, inconsistent, and prone to overlooking critical details that could make or break your project.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl p-8 relative">
        <div className="relative w-full max-w-3xl mx-auto h-96 flex items-center justify-center">
          {/* Central DevProposals.com */}
          <div className="relative z-10 flex flex-col items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg border border-gray-200">
            <Icon icon="mdi:check-circle-outline" className="text-green-500 text-xl mb-1" />
            <span className="text-sm font-bold text-gray-900 text-center leading-tight">DevProposals.com</span>
          </div>

          {/* Cards and Dashed Lines */}
          {processSteps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Dashed Line */}
              <div
                className="absolute border-t border-dashed border-gray-300 z-0"
                style={{
                  width: '80px',
                  height: '1px',
                  background: 'repeating-linear-gradient(to right, #d1d5db 0 4px, transparent 4px 8px)',
                  transformOrigin: 'center center',
                  position: 'absolute',
                  zIndex: 0,
                  ...(step.position === 'top-left' && { top: 'calc(50% - 16px)', left: 'calc(50% - 16px)', transform: 'translate(-100%, -100%) rotate(-135deg)' }),
                  ...(step.position === 'top-right' && { top: 'calc(50% - 16px)', right: 'calc(50% - 16px)', transform: 'translate(100%, -100%) rotate(135deg)' }),
                  ...(step.position === 'bottom-left' && { bottom: 'calc(50% - 16px)', left: 'calc(50% - 16px)', transform: 'translate(-100%, 100%) rotate(135deg)' }),
                  ...(step.position === 'bottom-right' && { bottom: 'calc(50% - 16px)', right: 'calc(50% - 16px)', transform: 'translate(100%, 100%) rotate(-135deg)' }),
                }}
              ></div>
              <div
                className={`absolute w-48 p-4 bg-gray-50 rounded-lg shadow-md text-center flex flex-col items-center z-20
                  ${step.position === 'top-left' ? 'top-2 left-2' : ''}
                  ${step.position === 'top-right' ? 'top-2 right-2' : ''}
                  ${step.position === 'bottom-left' ? 'bottom-2 left-2' : ''}
                  ${step.position === 'bottom-right' ? 'bottom-2 right-2' : ''}
                `}
              >
                <div className="bg-violet-800 rounded-full p-2 mb-3">
                  <Icon icon={step.icon} className="text-white text-lg" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 leading-tight">{step.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{step.description}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default ProblemStatement; 