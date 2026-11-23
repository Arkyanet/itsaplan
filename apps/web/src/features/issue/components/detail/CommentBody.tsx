import { useMemo } from 'react';
import type { FeedItem } from '@/lib/api/endpoints/activity';
import ChoiceGroup from '@/components/common/choice/ChoiceGroup';
import MarkdownEditor from '@/components/common/editor/MarkdownEditor';
import { ChoiceAnswerProvider } from '@/context/choiceAnswerContext';
import { useProjectQuery } from '@/services/projects.service';
import { splitChoiceBlocks } from '@/utils/choiceSpec';
import type { ComposerContext } from './CommentComposer';
import { useCreateComment } from '../../services/comments.service';

// A comment's text, with the multiple-choice questions an agent asked drawn as cards.
// Answering one replies in the thread and mentions the agent, which starts its next run.
export default function CommentBody({
  item,
  composer,
}: {
  item: FeedItem;
  composer?: ComposerContext;
}) {
  const body = item.body ?? '';
  const { text, choices } = useMemo(() => splitChoiceBlocks(body), [body]);
  const project = useProjectQuery(choices.length > 0 ? (composer?.projectKey ?? null) : null);
  const createComment = useCreateComment();

  const agent = project.data?.assignees.find(
    (a) => a.userId === item.actorUserId && a.kind === 'agent',
  );
  const onAnswer =
    composer && agent?.username
      ? async (answer: string) => {
          await createComment.mutateAsync({
            issueId: composer.issueId,
            input: {
              body: `@${agent.username} ${answer}`,
              replyToId: item.replyToId ?? item.id,
            },
          });
        }
      : null;

  return (
    <>
      {text && (
        <MarkdownEditor
          // The editor reads its content once, at mount: an edit has to remount it.
          key={text}
          className="text-sm text-foreground/90 [&_a.issue-ref]:mx-1 [&_a.issue-ref]:text-[0.9em]"
          defaultValue={text}
          editable={false}
        />
      )}
      {choices.length > 0 && (
        <ChoiceAnswerProvider onAnswer={onAnswer}>
          <ChoiceGroup specs={choices} />
        </ChoiceAnswerProvider>
      )}
    </>
  );
}
