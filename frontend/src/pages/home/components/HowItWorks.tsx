
import { Icon } from '@iconify/react';

const steps = [
  {
    number: '01',
    title: 'Upload Proposals',
    description: 'Upload your project proposals in any format - PDF, Word, or plain text.',
    icon: 'mdi:file-upload-outline'
  },
  {
    number: '02', 
    title: 'AI Analysis',
    description: 'Our AI analyzes each proposal for technical requirements, pricing, and key details.',
    icon: 'mdi:brain'
  },
  {
    number: '03',
    title: 'Smart Comparison',
    description: 'Get side-by-side comparisons with highlighted differences and recommendations.',
    icon: 'mdi:compare'
  },
  {
    number: '04',
    title: 'Make Decision',
    description: 'Choose the best proposal with confidence using our data-driven insights.',
    icon: 'mdi:check-circle-outline'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get from proposal upload to confident decision in minutes, not hours
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step Number */}
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon={step.icon} className="w-8 h-8" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connection Lines (for desktop) */}
        <div className="hidden lg:block relative mt-16">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/4 w-0.5 h-8 bg-gray-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-gray-200 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-3/4 w-0.5 h-8 bg-gray-200 transform -translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 