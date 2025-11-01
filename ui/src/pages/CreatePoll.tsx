import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from '@/hooks/useVoting';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Plus, X, Loader2, Calendar } from 'lucide-react';
import { MIN_OPTIONS, MAX_OPTIONS, MAX_QUESTION_LENGTH } from '@/lib/constants';
import { toast } from 'sonner';



export default function CreatePoll() {
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { createVoting, isLoading } = useVoting();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [endTime, setEndTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addOption = () => {
    if (options.length < MAX_OPTIONS) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    } else if (question.length > MAX_QUESTION_LENGTH) {
      newErrors.question = `Max ${MAX_QUESTION_LENGTH} characters`;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < MIN_OPTIONS) {
      newErrors.options = `At least ${MIN_OPTIONS} options required`;
    }

    const uniqueOptions = new Set(validOptions.map((o) => o.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      newErrors.options = 'Options must be unique';
    }

    if (endTime && new Date(endTime).getTime() <= Date.now()) {
      newErrors.endTime = 'End time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!validate()) return;

    try {
      const validOptions = options.filter((o) => o.trim());
      const endTimeMs = endTime ? new Date(endTime).getTime() : undefined;

      await createVoting({
        question: question.trim(),
        description: description.trim() || undefined,
        options: validOptions,
        endTime: endTimeMs,
      });

      alert('Poll created successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to create poll');
    }
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Please connect your wallet to create a poll
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Poll</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Question *
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is your favorite color?"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={MAX_QUESTION_LENGTH}
          />
          {errors.question && (
            <p className="text-sm text-red-500 mt-1">{errors.question}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more context about this poll..."
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Options * (min {MIN_OPTIONS}, max {MAX_OPTIONS})
          </label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.options && (
            <p className="text-sm text-red-500 mt-1">{errors.options}</p>
          )}
          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium mb-2">
            End Time (Optional)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {errors.endTime && (
            <p className="text-sm text-red-500 mt-1">{errors.endTime}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Poll'
          )}
        </button>
      </form>
    </div>
  );
}