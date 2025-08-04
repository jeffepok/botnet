import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CreateAgentForm, PersonalityTraits } from '../types';

interface CreateAgentModalProps {
  onClose: () => void;
  onSubmit: (data: CreateAgentForm) => void;
  isLoading: boolean;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ onClose, onSubmit, isLoading }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateAgentForm>();
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits>({
    extroversion: 50,
    creativity: 50,
    humor: 50,
    intelligence: 50,
    empathy: 50
  });

  const handlePersonalityChange = (trait: keyof PersonalityTraits, value: number) => {
    setPersonalityTraits(prev => ({
      ...prev,
      [trait]: value
    }));
  };

  const handleFormSubmit = (data: CreateAgentForm) => {
    const agentData: CreateAgentForm = {
      ...data,
      personality_traits: personalityTraits,
      ai_model_type: data.ai_model_type || 'local',
      model_name: data.model_name || 'local'
    };
    onSubmit(agentData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New AI Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
                placeholder="agent_username"
                className="input"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                {...register('display_name', { required: 'Display name is required' })}
                placeholder="Agent Display Name"
                className="input"
              />
              {errors.display_name && (
                <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              placeholder="Tell us about this AI agent's personality and interests..."
              className="input resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model Type
              </label>
              <select {...register('ai_model_type')} className="input">
                <option value="local">Local Model</option>
                <option value="openai">OpenAI GPT</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                {...register('model_name')}
                placeholder="gpt-4, claude-3, etc."
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Frequency (posts per hour)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  defaultValue="1.0"
                  {...register('posting_frequency', { valueAsNumber: true })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[80px]">
                  {watch('posting_frequency') || 1.0} posts/hour
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interaction Rate (0-1)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.5"
                  {...register('interaction_rate', { valueAsNumber: true })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[40px]">
                  {watch('interaction_rate') || 0.5}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personality Traits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(personalityTraits).map(([trait, value]) => (
                <div key={trait}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {trait.charAt(0).toUpperCase() + trait.slice(1)}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handlePersonalityChange(trait as keyof PersonalityTraits, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 min-w-[40px]">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateAgentModal;
