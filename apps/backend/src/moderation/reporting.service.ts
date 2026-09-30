import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ModerationRepository, TicketIngest } from '@db/repositories/moderation/moderation.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';

type Severity = 'high' | 'medium' | 'low';

/** Customer report reason (moderation vocabulary + comment aliases) → moderation category. */
export const CUSTOMER_REASON_TO_CATEGORY: Record<string, string> = {
  hate_speech: 'hate_speech',
  spam: 'spam',
  nudity: 'nudity',
  violence: 'violence',
  harassment: 'harassment',
  other: 'other',
  nudity_sexual: 'nudity',
  violence_gore: 'violence',
  harassment_bullying: 'harassment',
};

export const CATEGORY_SEVERITY: Record<string, Severity> = {
  hate_speech: 'high',
  nudity: 'high',
  violence: 'high',
  harassment: 'medium',
  spam: 'low',
  other: 'low',
};

const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
};

/**
 * Customer-facing reporting of videos (content) and users. Each report rolls up into the
 * subject's open moderation ticket (one per subject); one open report per reporter per subject.
 */
@Injectable()
export class ReportingService {
  constructor(
    private readonly tickets: ModerationRepository,
    private readonly content: ContentRepository,
    private readonly users: UsersRepository,
  ) {}

  async reportContent(reporterId: string, contentId: string, reason: string, note?: string) {
    const content = await this.content.findById(contentId);
    if (!content || content.status !== 'published') {
      throw new NotFoundException('Content not found');
    }
    return this.file(reporterId, { subjectType: 'content', subjectId: contentId, contentSnapshot: content.title }, reason, note, 'this video');
  }

  async reportUser(reporterId: string, userId: string, reason: string, note?: string) {
    if (reporterId === userId) {
      throw new BadRequestException('You cannot report yourself');
    }
    const user = await this.users.findById(userId);
    if (!user || user.accountType !== 'customer') {
      throw new NotFoundException('User not found');
    }
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const snapshot = [user.username ? `@${user.username}` : null, name || null].filter(Boolean).join(' · ') || `User ${userId}`;
    return this.file(reporterId, { subjectType: 'user', subjectId: userId, offenderUserId: userId, contentSnapshot: snapshot }, reason, note, 'this user');
  }

  private async file(
    reporterId: string,
    subject: Pick<TicketIngest, 'subjectType' | 'subjectId' | 'contentSnapshot' | 'offenderUserId'>,
    reason: string,
    note: string | undefined,
    label: string,
  ): Promise<{ ticketId: string; status: 'received' }> {
    const category = CUSTOMER_REASON_TO_CATEGORY[reason] ?? 'other';
    if (await this.tickets.hasOpenReport(subject.subjectType, subject.subjectId, reporterId)) {
      throw new ConflictException(`You already reported ${label}`);
    }
    try {
      const ticketId = await this.tickets.createOrBumpTicket({
        ...subject,
        category,
        severity: CATEGORY_SEVERITY[category] ?? 'low',
        reporterUserId: reporterId,
        reason: category,
        ...(note ? { note } : {}),
      });
      return { ticketId, status: 'received' };
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(`You already reported ${label}`);
      }
      throw err;
    }
  }
}
