import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReactionRepository } from '@db/repositories/engagement/reaction.repository';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ContentAccessService } from '../services/content-access.service';
import { BatchReactionsQueryDto } from './dto/reaction.dto';
import { ReactionService } from './reaction.service';

const A = '0199aaaa-0000-7000-8000-000000000001';
const B = '0199aaaa-0000-7000-8000-000000000002';

describe('ReactionService.mine (batch my reactions)', () => {
  it('maps every requested id, null when no reaction', async () => {
    const repo = { getUserReactions: jest.fn().mockResolvedValue(new Map([[A, 'like']])) };
    const svc = new ReactionService(repo as unknown as ReactionRepository, {} as ContentAccessService, {} as EventEmitter2);
    await expect(svc.mine('u1', [A, B])).resolves.toEqual({ reactions: { [A]: 'like', [B]: null } });
    expect(repo.getUserReactions).toHaveBeenCalledWith('u1', [A, B]);
  });

  it('query DTO splits, dedupes and validates ids', async () => {
    const ok = plainToInstance(BatchReactionsQueryDto, { ids: `${A}, ${B},${A}` });
    expect(ok.ids).toEqual([A, B]);
    expect(await validate(ok)).toHaveLength(0);
    const repeated = plainToInstance(BatchReactionsQueryDto, { ids: [A, B] });
    expect(repeated.ids).toEqual([A, B]);
    expect(await validate(plainToInstance(BatchReactionsQueryDto, { ids: 'nope' }))).not.toHaveLength(0);
    expect(await validate(plainToInstance(BatchReactionsQueryDto, { ids: '' }))).not.toHaveLength(0);
  });
});
