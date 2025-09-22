import { NextRequest, NextResponse } from 'next/server'
import type { OnboardingQuestion } from '@/shared/types/auth'

// Mock database for onboarding questions
let questions: OnboardingQuestion[] = [
  {
    id: '1',
    type: 'single-choice',
    question: 'Choose your gender/sex',
    options: ['Male', 'Female', 'Prefer not to say', 'Other'],
    required: true,
    order: 1
  },
  {
    id: '2',
    type: 'single-choice',
    question: 'What is your age range?',
    options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
    required: true,
    order: 2
  },
  {
    id: '3',
    type: 'multiple-choice',
    question: 'What mental health topics are you most interested in addressing?',
    options: [
      'Anxiety and Stress',
      'Depression',
      'Relationship Issues',
      'Work-Life Balance',
      'Self-Esteem',
      'Trauma',
      'Sleep Issues',
      'Addiction'
    ],
    required: true,
    order: 3
  },
  {
    id: '4',
    type: 'scale',
    question: 'How would you rate your current overall mental health?',
    required: true,
    order: 4
  },
  {
    id: '5',
    type: 'boolean',
    question: 'Have you previously worked with a mental health professional?',
    required: true,
    order: 5
  },
  {
    id: '6',
    type: 'text',
    question: 'Is there anything specific you would like to work on or achieve through therapy?',
    required: false,
    order: 6
  }
]

export async function GET() {
  try {
    return NextResponse.json(questions.sort((a, b) => a.order - b.order))
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const question: Omit<OnboardingQuestion, 'id'> = await request.json()

    // Validate input
    if (!question.question || !question.type) {
      return NextResponse.json(
        { message: 'Question and type are required' },
        { status: 400 }
      )
    }

    const newQuestion: OnboardingQuestion = {
      ...question,
      id: Math.random().toString(36).substr(2, 9),
    }

    questions.push(newQuestion)

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}