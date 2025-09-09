
import React from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} flex-1`}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-blue-600" />
                </div>
                <a href="#" className="relative w-8 h-8 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-900">
                  <CheckIcon className="w-5 h-5 text-white" />
                  <span className="sr-only">{step}</span>
                </a>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full" aria-current="step">
                  <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </a>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <a href="#" className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                  <span className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300" aria-hidden="true" />
                  <span className="sr-only">{step}</span>
                </a>
              </>
            )}
             <span className="absolute top-10 left-1/2 -translate-x-1/2 w-max text-center text-xs sm:text-sm font-medium text-slate-600">{step}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
