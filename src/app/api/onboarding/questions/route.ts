import { NextResponse } from 'next/server'
import type { OnboardingSection } from '@/shared/types/auth'

// Mock database for onboarding questions, structured into sections
const sections: OnboardingSection[] = [
  {
    id: 'basic-info',
    title: 'I. BASIC INFORMATION',
    questions: [
      {
        id: 'gender',
        order: 1,
        type: 'single-choice',
        question: 'Sex / Gender:',
        options: ['Male', 'Female', 'Other', 'Prefer not to say'],
        required: true,
      },
      {
        id: 'family-history',
        order: 2,
        type: 'text',
        question: 'Family medical history / genetic conditions: For example: schizophrenia, diabetes, cardiovascular diseases, etc.',
        required: false,
      },
      {
        id: 'physical-health',
        order: 3,
        type: 'text',
        question: 'Current physical health conditions: For example: asthma, migraines, digestive disorders, hormonal imbalances, etc.',
        required: false,
      },
      {
        id: 'financial-status',
        order: 4,
        type: 'scale-with-comment',
        question: 'Current financial status: How financially secure do you feel?',
        required: true,
        commentLabel: 'Comment',
      },
    ],
  },
  {
    id: 'life-areas',
    title: 'II. LIFE AREAS ASSESSMENT (1–5 scale)',
    questions: [
      {
        id: 'professional-life',
        order: 5,
        type: 'scale-with-comment',
        question: 'Professional or educational life: How do you feel about your work or studies?',
        required: true,
        commentLabel: 'What would you like to improve? (Consider interest, stress, productivity, relationships with colleagues/classmates)',
      },
      {
        id: 'romantic-relationships',
        order: 6,
        type: 'scale-with-comment',
        question: 'Intimate / romantic relationships: How satisfied are you with your romantic relationships (if any)? (Quality, stability, support, conflicts)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'family-relationships',
        order: 7,
        type: 'scale-with-comment',
        question: 'Family relationships (parents, children, relatives): How are your relationships with family members? (Support, conflicts, responsibilities)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'social-relationships',
        order: 8,
        type: 'scale-with-comment',
        question: 'Social relationships and friendships: Do you have a supportive social circle? (Friends, colleagues, participation in social life)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'autonomy',
        order: 9,
        type: 'scale-with-comment',
        question: 'Ability to be alone / autonomy: How comfortable are you spending time by yourself? (Sense of solitude, independence, self-reflection)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'physical-health-rating',
        order: 10,
        type: 'scale-with-comment',
        question: 'Physical health: How would you rate your current physical health? (Sleep, nutrition, chronic conditions, energy levels)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'emotional-wellbeing',
        order: 11,
        type: 'scale-with-comment',
        question: 'Emotional well-being: How often do you experience emotional discomfort? (Anxiety, low mood, mood swings)',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'leisure-hobbies',
        order: 12,
        type: 'scale-with-comment',
        question: 'Leisure and hobbies: Do you have regular activities that bring you joy and relaxation?',
        required: true,
        commentLabel: 'Comment',
      },
      {
        id: 'living-conditions',
        order: 13,
        type: 'scale-with-comment',
        question: 'Living conditions and safety: Do you feel safe and comfortable in your current living situation?',
        required: true,
        commentLabel: 'Comment',
      },
    ],
  },
];

export async function GET() {
  try {
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
