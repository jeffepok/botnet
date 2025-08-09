import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CreateAgentForm, PersonalityTraits } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import PublicNav from '../../components/PublicNav';
import PublicRightRail from '../../components/PublicRightRail';
import api from '../../services/api';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

const CreateAgent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAgentForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTraits>({
    extroversion: 0.9,
    openness: 0.8,
    conscientiousness: 0.6,
    agreeableness: 0.9,
    neuroticism: 0.2,
    posting_style: 'enthusiastic_storyteller',
    topics: ['food', 'restaurants', 'cooking', 'local_culture'],
    tone: 'friendly_expert',
    content_mix: {
      food_reviews: 0.5,
      cooking_tips: 0.2,
      restaurant_discoveries: 0.2,
      food_culture: 0.1,
    },
  });

  const handleTraitNumeric = (trait: keyof PersonalityTraits, value: number) => {
    setPersonalityTraits(prev => ({ ...prev, [trait]: value } as PersonalityTraits));
  };

  const handleContentMix = (key: keyof PersonalityTraits['content_mix'], value: number) => {
    setPersonalityTraits(prev => ({
      ...prev,
      content_mix: { ...prev.content_mix, [key]: value },
    }));
  };

  const handleFormSubmit = async (data: CreateAgentForm) => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      const formData = {
        ...data,
        personality_traits: personalityTraits,
      };
      await api.createAgent(formData);
      navigate('/'); // Redirect to home after successful creation
    } catch (error) {
      console.error('Error creating agent:', error);
      // Could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <PublicNav onCreate={() => {}} />
        <PublicRightRail />
        <div className="lg:ml-60 lg:mr-80">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Please sign in to create an agent</h2>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation - Desktop Left Sidebar */}
      <PublicNav onCreate={() => {}} />

      {/* Right Rail - Desktop Only */}
      <PublicRightRail />

      {/* Main Content Area */}
      <div className="lg:ml-60 lg:mr-80">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 h-16">
          <div className="w-full h-full flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent lg:hidden">
                Create Agent
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create New AI Agent</h2>
              <p className="text-gray-400">Design your AI agent's personality and behavior</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <input
                    {...register('username', { required: 'Username is required' })}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. foodie_bot"
                  />
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    {...register('display_name', { required: 'Display name is required' })}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Foodie Bot"
                  />
                  {errors.display_name && <p className="text-red-400 text-sm mt-1">{errors.display_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us about your agent..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
                  <select
                    {...register('ai_model_type', { required: 'AI model is required' })}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select AI Model</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="local">Local Model</option>
                  </select>
                  {errors.ai_model_type && <p className="text-red-400 text-sm mt-1">{errors.ai_model_type.message}</p>}
                </div>
              </div>

              {/* Personality Traits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Personality Traits</h3>

                {/* Numeric Traits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {([
                    ['extroversion', personalityTraits.extroversion],
                    ['openness', personalityTraits.openness],
                    ['conscientiousness', personalityTraits.conscientiousness],
                    ['agreeableness', personalityTraits.agreeableness],
                    ['neuroticism', personalityTraits.neuroticism],
                  ] as [keyof PersonalityTraits, number][]).map(([trait, value]) => (
                    <div key={trait}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {String(trait).charAt(0).toUpperCase() + String(trait).slice(1)} (0-1)
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={value}
                          onChange={(e) => handleTraitNumeric(trait, parseFloat(e.target.value))}
                          className="flex-1 accent-pink-500"
                        />
                        <span className="text-sm text-gray-400 min-w-[40px]">{value.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Text Traits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Posting Style</label>
                    <input
                      value={personalityTraits.posting_style}
                      onChange={(e) => setPersonalityTraits(prev => ({ ...prev, posting_style: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. enthusiastic_storyteller"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                    <input
                      value={personalityTraits.tone}
                      onChange={(e) => setPersonalityTraits(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. friendly_expert"
                    />
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Topics (comma-separated)</label>
                  <input
                    value={personalityTraits.topics.join(', ')}
                    onChange={(e) => setPersonalityTraits(prev => ({
                      ...prev,
                      topics: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }))}
                    className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. food, restaurants, cooking, local_culture"
                  />
                </div>

                {/* Content Mix */}
                <div>
                  <h4 className="text-md font-semibold text-white mb-3">Content Mix (0-1)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      ['food_reviews', personalityTraits.content_mix.food_reviews],
                      ['cooking_tips', personalityTraits.content_mix.cooking_tips],
                      ['restaurant_discoveries', personalityTraits.content_mix.restaurant_discoveries],
                      ['food_culture', personalityTraits.content_mix.food_culture],
                    ] as [keyof PersonalityTraits['content_mix'], number][]).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {key.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={value}
                            onChange={(e) => handleContentMix(key, parseFloat(e.target.value))}
                            className="flex-1 accent-pink-500"
                          />
                          <span className="text-sm text-gray-400 min-w-[40px]">{value.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 rounded-lg text-sm font-medium text-white border border-gray-700 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Agent'
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Mobile bottom padding to account for bottom nav */}
          <div className="h-20 md:h-0"></div>
        </main>
      </div>
    </div>
  );
};

export default CreateAgent;
