import React from "react";

type DemoControlsProps = {
  currentStep: number;
  stepCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

const DemoControls: React.FC<DemoControlsProps> = ({ currentStep, stepCount, onPrevious, onNext }) => {
  return (
    <div className="flex items-center justify-between gap-4 w-full mt-7">
      <button
        onClick={onPrevious}
        type="button"
        disabled={currentStep === 0}
        className={`min-w-[120px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
          currentStep === 0
            ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
            : "border-slate-300 bg-white text-sky-700 hover:bg-slate-50"
        }`}
      >
        Previous
      </button>

      <button
        onClick={onNext}
        type="button"
        className="min-w-[120px] rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
      >
        {currentStep === stepCount - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
};

export default DemoControls;
