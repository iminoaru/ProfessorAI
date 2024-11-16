const PIPELINE_STEPS = ['Ingest', 'Chunk', 'Lessons', 'Tests', 'Graph', 'Distribute'];

export default function WorkflowProgress({ currentStep }: { currentStep: string }) {
  const currIdx = PIPELINE_STEPS.findIndex((step) => step == currentStep);
  return (
    <div className="flex relative justify-between items-center gap-x-16 mb-20">
      <hr className="absolute left-0 right-0 top-[8px] rounded-xl border-2 border-black -z-1" />
      {PIPELINE_STEPS.map((step, index) => (
        <StepIndicator key={index} label={step} complete={index < currIdx} />
      ))}
    </div>
  );
}

function StepIndicator({ complete = false, label }: { complete: boolean; label: string }) {
  return (
    <div className="flex relative flex-col gap-y-1 items-center">
      <div
        className={`size-5 rounded-xl border-2 border-black ${complete ? 'bg-black' : 'bg-white'}`}
      ></div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}