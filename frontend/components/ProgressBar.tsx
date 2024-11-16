import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

const steps = [
  { name: 'Upload', path: '/gen/create' },
  { name: 'Instruct', path: '/gen/instruct' },
  { name: 'Review', path: '/gen/review' },
  { name: 'Chunks', path: '/gen/chunks' },
  { name: 'Chat', path: '/gen/chat' },
  { name: 'Lessons', path: '/gen/lessons' },
  { name: 'Tests', path: '/gen/tests' },
];

const ProgressBar: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const currentStepIndex = steps.findIndex(step => currentPath.includes(step.path));

  // Extract course_id from the current path
  const pathParts = currentPath.split('/');
  const course_id = pathParts[pathParts.length - 1];

  const handleStepClick = (index: number) => {
    if (index <= currentStepIndex) {
      // Allow navigation to current or previous steps
      let newPath = steps[index].path;
      if (index !== 0) { // If it's not the 'Upload' step
        newPath += `/${course_id}`;
      }
      router.push(newPath);
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      <div className="flex justify-between items-center w-full max-w-md">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;

          return (
            <div 
              key={index} 
              className="flex flex-col items-center"
              onClick={() => handleStepClick(index)}
              style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-sm md:text-base
                  ${isCompleted || isCurrent ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                  ${isClickable && !isCurrent ? 'hover:bg-primary-dark' : ''}
                  transition-colors duration-200`}
              >
                {index + 1}
              </div>
              <div className={`text-xs md:text-sm mt-1 md:mt-2 
                ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-600'}
                ${isClickable ? 'hover:text-primary-dark' : ''}
                transition-colors duration-200
                hidden sm:block`}>
                {step.name}
              </div>
              <div className={`text-xs md:text-sm mt-1 md:mt-2 
                ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-600'}
                ${isClickable ? 'hover:text-primary-dark' : ''}
                transition-colors duration-200
                sm:hidden`}>
                {step.name.substring(0, 3)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative w-full max-w-md h-1 bg-gray-200 mt-2 md:mt-4">
        <div
          className="absolute bg-primary h-1 transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;