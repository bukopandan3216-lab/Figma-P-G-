import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';
import CustomerNav from '../../components/CustomerNav';


interface QuizStep {
  id: string;
  question: string;
  subtitle?: string;
  options: { label: string; description?: string; emoji?: string }[];
  multi?: boolean;
}

const steps: QuizStep[] = [
  {
    id: 'concern',
    question: 'What is your concern?',
    subtitle: 'Choose the area you want personalized recommendations for.',
    options: [
      { label: 'Hair', emoji: '💇' },
      { label: 'Skin', emoji: '🧴' },
      { label: 'Body', emoji: '🧍' },
    ],
  },

  {
    id: 'skinType',
    question: 'What is your skin type?',
    subtitle: 'Select the one that best describes your skin most days.',
    options: [
      { label: 'Oily', description: 'Shiny, prone to breakouts', emoji: '💧' },
      { label: 'Dry', description: 'Tight, flaky, or dull', emoji: '🌵' },
      { label: 'Combination', description: 'Oily T-zone, dry cheeks', emoji: '⚖️' },
      { label: 'Normal', description: 'Balanced and comfortable', emoji: '✨' },
      { label: 'Sensitive', description: 'Easily irritated or reactive', emoji: '🌸' },
    ],
  },
  {
    id: 'skinConcern',
    question: 'What are your primary skin concerns?',
    subtitle: 'Select all that apply.',
    multi: true,
    options: [
      { label: 'Acne & Breakouts', emoji: '😤' },
      { label: 'Fine Lines & Wrinkles', emoji: '🪞' },
      { label: 'Dark Spots & Uneven Tone', emoji: '🌑' },
      { label: 'Dryness & Dehydration', emoji: '💦' },
      { label: 'Large Pores', emoji: '🔬' },
      { label: 'Redness & Irritation', emoji: '🔴' },
    ],
  },

  {
    id: 'hairType',
    question: 'What is your hair type?',
    options: [
      { label: 'Straight', emoji: '➖' },
      { label: 'Wavy', emoji: '〰️' },
      { label: 'Curly', emoji: '🌀' },
      { label: 'Coily / Kinky', emoji: '🔁' },
    ],
  },
  {
    id: 'hairConcern',
    question: 'What are your hair concerns?',
    multi: true,
    options: [
      { label: 'Dandruff', emoji: '❄️' },
      { label: 'Breakage & Damage', emoji: '💔' },
      { label: 'Dryness', emoji: '🌵' },
      { label: 'Oily Scalp', emoji: '💧' },
      { label: 'Frizz', emoji: '⚡' },
      { label: 'Volume & Fullness', emoji: '🎈' },
    ],
  },

  {
    id: 'bodyConcern',
    question: 'What are your body concerns?',
    subtitle: 'Select all that apply.',
    multi: true,
    options: [
      { label: 'Dry Skin', emoji: '🌵' },
      { label: 'Body Acne', emoji: '🔴' },
      { label: 'Dark Spots', emoji: '🌑' },
      { label: 'Stretch Marks', emoji: '✨' },
      { label: 'Rough Skin', emoji: '🧴' },
      { label: 'Body Odor', emoji: '🌸' },
    ],
  },

  {
    id: 'age',
    question: 'What is your age range?',
    options: [
      { label: 'Under 20', emoji: '🌱' },
      { label: '20–29', emoji: '🌟' },
      { label: '30–39', emoji: '✨' },
      { label: '40–49', emoji: '💎' },
      { label: '50+', emoji: '👑' },
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>(Array(steps.length).fill(null));
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  //added
  const concern = answers[0] as string;

const filteredSteps = steps.filter((s) => {
  if (s.id === 'concern' || s.id === 'age') return true;

  if (concern === 'Skin') {
    return s.id === 'skinType' || s.id === 'skinConcern';
  }

  if (concern === 'Hair') {
    return s.id === 'hairType' || s.id === 'hairConcern';
  }

  if (concern === 'Body') {
    return s.id === 'bodyConcern';
  }

  return false;
});

const current = filteredSteps[step];
const answer = answers[steps.findIndex((s) => s.id === current.id)];

  //const current = steps[step];
  //const answer = answers[step];

  const toggleOption = (label: string) => {
  const index = steps.findIndex((s) => s.id === current.id);

  if (current.multi) {
    const prev = (answers[index] as string[]) || [];
    const next = prev.includes(label)
      ? prev.filter((x) => x !== label)
      : [...prev, label];

    setAnswers((a) => a.map((v, i) => (i === index ? next : v)));
  } else {
    setAnswers((a) => a.map((v, i) => (i === index ? label : v)));
  }
};

  //const toggleOption = (label: string) => {
  //  if (current.multi) {
   //   const prev = (answer as string[]) || [];
   //   const next = prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label];
  //    setAnswers(a => a.map((v, i) => i === step ? next : v));
  //  } else {
  //    setAnswers(a => a.map((v, i) => i === step ? label : v));
  //  }
  //};

  const isSelected = (label: string) => {
  const index = steps.findIndex((s) => s.id === current.id);
  const answer = answers[index];

  if (current.multi) return ((answer as string[]) || []).includes(label);
  return answer === label;
};
  //const isSelected = (label: string) => {
   // if (current.multi) return ((answer as string[]) || []).includes(label);
   // return answer === label;
  //};

  const canNext = current.multi
  ? ((answer as string[])?.length ?? 0) > 0
  : !!answer;
  //const canNext = current.multi ? ((answer as string[])?.length > 0) : !!answer;

  const handleNext = () => {
  if (step < filteredSteps.length - 1) {
    setStep((s) => s + 1);
  } else {
    setDone(true);
  }
};

  //const handleNext = () => {
   // if (step < steps.length - 1) setStep(s => s + 1);
   // else setDone(true);
  //};

  if (done) return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--rose-light)] flex items-center justify-center mx-auto mb-6">
          <Sparkles size={36} className="text-[var(--primary)]" />
        </div>
        <h1 className="font-display text-4xl mb-3">Your Profile is Ready!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">We've analyzed your beauty profile and curated personalized product recommendations just for you.</p>
        <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 mb-8 text-left">
          
          
          {filteredSteps.map((s) => {
  const index = steps.findIndex((step) => step.id === s.id);

  return (
    <div key={s.id} className="flex items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0 text-sm">
      <Check size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">
          {s.question.replace('What is your ', '').replace('What are your ', '').replace('?', '').replace(/^\w/, c => c.toUpperCase())}:
        </span>{' '}
        <span className="text-[var(--muted-foreground)]">
          {Array.isArray(answers[index])
            ? (answers[index] as string[]).join(', ') || 'None selected'
            : (answers[index] as string) || 'Not answered'}
        </span>
      </div>
    </div>
  );
})}
          
          {/* {filteredSteps.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0 text-sm">
                        <Check size={14} className="text-[var(--primary)] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{s.question.replace('What is your ', '').replace('What are your ', '').replace('?', '').replace(/^\w/, c => c.toUpperCase())}: </span>
                          <span className="text-[var(--muted-foreground)]">
                            {Array.isArray(answers[i]) ? (answers[i] as string[]).join(', ') || 'None selected' : (answers[i] as string) || 'Not answered'}
                          </span>
                        </div>
                      </div>
                    )
                    )} 
          )*/}
        </div>
        <Button size="lg" onClick={() => navigate('/for-you')}>
          View My Recommendations <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" style={{ width: `${((step + 1) / filteredSteps.length) * 100}%` }} />
          </div>
          <span className="text-xs text-[var(--muted-foreground)] font-mono flex-shrink-0">{step + 1} / {filteredSteps.length}</span>
        </div>

        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center font-medium">{step + 1}</div>
            <span className="text-xs text-[var(--primary)] font-medium uppercase tracking-wide">Question {step + 1}</span>
          </div>
          <h2 className="font-display text-3xl mb-1">{current.question}</h2>
          {current.subtitle && <p className="text-[var(--muted-foreground)] text-sm mb-6">{current.subtitle}</p>}
          {!current.subtitle && <div className="mb-6" />}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {current.options.map(opt => (
              <button
                key={opt.label}
                onClick={() => toggleOption(opt.label)}
                className={`relative text-left p-4 rounded-[var(--radius-xl)] border-2 transition-all ${isSelected(opt.label) ? 'border-[var(--primary)] bg-[var(--rose-light)]' : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--secondary)]'}`}
              >
                {isSelected(opt.label) && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
                {opt.emoji && <div className="text-2xl mb-2">{opt.emoji}</div>}
                <div className="text-sm font-semibold text-[var(--foreground)]">{opt.label}</div>
                {opt.description && <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{opt.description}</div>}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={15} /> Back
              </Button>
            )}
            <Button className="flex-1" disabled={!canNext} onClick={handleNext}>
              {step === filteredSteps.length - 1 ? 'See My Results' : 'Continue'} <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
