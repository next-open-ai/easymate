import type { AgentEvent, ChatRequest } from '@easymate/contracts';
import { DEFAULT_RUN_TIMEOUT_MS, streamAgentReply as streamAgentReplyViaPi } from './pi-runtime.js';
import { attachBuiltinSkillPackages } from './builtin-skill-packages.js';
import { assertVisionSupported } from './image-input.js';

export { DEFAULT_RUN_TIMEOUT_MS };
export type PiStreamInput = ChatRequest & { abortSignal?: AbortSignal };

/**
 * EasyMate deliberately has one in-process agent engine: Pi.
 * This avoids sidecar startup, routing ambiguity and packaging dependencies
 * while preserving the complete higher-level product feature set.
 */
export async function* streamAgentReply(input: PiStreamInput): AsyncGenerator<AgentEvent> {
  const preparedInput: PiStreamInput = {
    ...input,
    engine: 'pi',
    skills: await attachBuiltinSkillPackages(input.skills ?? []),
  };
  assertVisionSupported(preparedInput.messages, preparedInput.model.supportsVision, 'pi', preparedInput.modelCapabilities);
  for await (const event of streamAgentReplyViaPi(preparedInput)) {
    if (event.type === 'run.started') {
      yield { ...event, engine: 'pi' };
      continue;
    }
    yield event;
  }
}
