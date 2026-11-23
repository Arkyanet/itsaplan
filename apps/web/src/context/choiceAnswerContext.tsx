'use client';

import { createContext, useContext, type ReactNode } from 'react';

// Where the answer to a choice card goes: the next chat message, or a reply comment
// that mentions the agent. Without a provider the card shows its options read-only.
type ChoiceAnswer = ((answer: string) => void | Promise<void>) | null;

const ChoiceAnswerContext = createContext<ChoiceAnswer>(null);

export function ChoiceAnswerProvider({
  onAnswer,
  children,
}: {
  onAnswer: ChoiceAnswer;
  children: ReactNode;
}) {
  return <ChoiceAnswerContext.Provider value={onAnswer}>{children}</ChoiceAnswerContext.Provider>;
}

export function useChoiceAnswer(): ChoiceAnswer {
  return useContext(ChoiceAnswerContext);
}
