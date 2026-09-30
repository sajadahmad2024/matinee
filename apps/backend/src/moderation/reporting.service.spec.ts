import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { ModerationRepository } from '@db/repositories/moderation/moderation.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { CATEGORIES } from './dto/moderation.dto';
import { CATEGORY_SEVERITY, CUSTOMER_REASON_TO_CATEGORY, ReportingService } from './reporting.service';

function build() {
  const tickets = { hasOpenReport: jest.fn().mockResolvedValue(false), createOrBumpTicket: jest.fn().mockResolvedValue('t1') };
  const content = { findById: jest.fn().mockResolvedValue({ id: 'k1', title: 'Movie', status: 'published' }) };
  const users = { findById: jest.fn().mockResolvedValue({ id: 'u2', accountType: 'customer', username: 'bob', firstName: 'Bob', lastName: null }) };
  const svc = new ReportingService(tickets as unknown as ModerationRepository, content as unknown as ContentRepository, users as unknown as UsersRepository);
  return { svc, tickets, content, users };
}

describe('ReportingService', () => {
  it('maps every reason onto the moderation vocabulary', () => {
    for (const cat of Object.values(CUSTOMER_REASON_TO_CATEGORY)) {
      expect(CATEGORIES).toContain(cat);
      expect(CATEGORY_SEVERITY[cat]).toBeDefined();
    }
  });

  it('reports content → content ticket without offender', async () => {
    const m = build();
    await expect(m.svc.reportContent('u1', 'k1', 'nudity_sexual', 'bad')).resolves.toEqual({ ticketId: 't1', status: 'received' });
    expect(m.tickets.createOrBumpTicket).toHaveBeenCalledWith({ subjectType: 'content', subjectId: 'k1', contentSnapshot: 'Movie', category: 'nudity', severity: 'high', reporterUserId: 'u1', reason: 'nudity', note: 'bad' });
  });

  it('404 for missing / unpublished content', async () => {
    const m = build();
    m.content.findById.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'k1', status: 'draft' });
    await expect(m.svc.reportContent('u1', 'k1', 'spam')).rejects.toBeInstanceOf(NotFoundException);
    await expect(m.svc.reportContent('u1', 'k1', 'spam')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reports a user → user ticket with the user as offender', async () => {
    const m = build();
    await m.svc.reportUser('u1', 'u2', 'harassment');
    expect(m.tickets.createOrBumpTicket).toHaveBeenCalledWith(expect.objectContaining({ subjectType: 'user', subjectId: 'u2', offenderUserId: 'u2', contentSnapshot: '@bob · Bob', severity: 'medium' }));
  });

  it('rejects self-reports and non-customers', async () => {
    const m = build();
    await expect(m.svc.reportUser('u1', 'u1', 'spam')).rejects.toBeInstanceOf(BadRequestException);
    m.users.findById.mockResolvedValueOnce({ id: 'a', accountType: 'admin' });
    await expect(m.svc.reportUser('u1', 'a', 'spam')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('409 when already reported (pre-check or unique violation)', async () => {
    const m = build();
    m.tickets.hasOpenReport.mockResolvedValueOnce(true);
    await expect(m.svc.reportContent('u1', 'k1', 'spam')).rejects.toBeInstanceOf(ConflictException);
    m.tickets.createOrBumpTicket.mockRejectedValueOnce({ cause: { code: '23505' } });
    await expect(m.svc.reportContent('u1', 'k1', 'spam')).rejects.toBeInstanceOf(ConflictException);
  });
});
