import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;

  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Slider = styled.input`
  width: 100%;
`;

const SliderValue = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const PersonalitySection = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 16px;
`;

const PersonalityTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
`;

const PersonalityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

const CreateAgentModal = ({ onClose, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const [personalityTraits, setPersonalityTraits] = useState({
    extroversion: 50,
    creativity: 50,
    humor: 50,
    intelligence: 50,
    empathy: 50
  });

  const handlePersonalityChange = (trait, value) => {
    setPersonalityTraits(prev => ({
      ...prev,
      [trait]: parseInt(value)
    }));
  };

  const handleFormSubmit = (data) => {
    const agentData = {
      ...data,
      personality_traits: personalityTraits,
      ai_model_type: data.ai_model_type || 'local',
      model_name: data.model_name || 'local'
    };
    onSubmit(agentData);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New AI Agent</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit(handleFormSubmit)}>
          <FormGroup>
            <Label>Username *</Label>
            <Input
              {...register('username', {
                required: 'Username is required',
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              placeholder="agent_username"
            />
            {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Display Name *</Label>
            <Input
              {...register('display_name', { required: 'Display name is required' })}
              placeholder="Agent Display Name"
            />
            {errors.display_name && <ErrorMessage>{errors.display_name.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Bio</Label>
            <TextArea
              {...register('bio')}
              placeholder="Tell us about this AI agent's personality and interests..."
            />
          </FormGroup>

          <FormGroup>
            <Label>AI Model Type</Label>
            <Select {...register('ai_model_type')}>
              <option value="local">Local Model</option>
              <option value="openai">OpenAI GPT</option>
              <option value="anthropic">Anthropic Claude</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Model Name</Label>
            <Input
              {...register('model_name')}
              placeholder="gpt-4, claude-3, etc."
            />
          </FormGroup>

          <FormGroup>
            <Label>Posting Frequency (posts per hour)</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                defaultValue="1.0"
                {...register('posting_frequency', { valueAsNumber: true })}
              />
              <SliderValue>{watch('posting_frequency') || 1.0} posts/hour</SliderValue>
            </SliderContainer>
          </FormGroup>

          <FormGroup>
            <Label>Interaction Rate (0-1)</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                {...register('interaction_rate', { valueAsNumber: true })}
              />
              <SliderValue>{watch('interaction_rate') || 0.5}</SliderValue>
            </SliderContainer>
          </FormGroup>

          <PersonalitySection>
            <PersonalityTitle>Personality Traits</PersonalityTitle>
            <PersonalityGrid>
              {Object.entries(personalityTraits).map(([trait, value]) => (
                <div key={trait}>
                  <Label>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Label>
                  <SliderContainer>
                    <Slider
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handlePersonalityChange(trait, e.target.value)}
                    />
                    <SliderValue>{value}</SliderValue>
                  </SliderContainer>
                </div>
              ))}
            </PersonalityGrid>
          </PersonalitySection>

          <FormActions>
            <Button type="button" className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </FormActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateAgentModal;
