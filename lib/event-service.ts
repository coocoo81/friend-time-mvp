import { Prisma } from "@prisma/client";
import { SLOT_CONFIG } from "@/lib/constants";
import { enumerateDates, formatDisplayDate, toDateOnlyString } from "@/lib/date";
import { prisma } from "@/lib/prisma";

const eventInclude = {
  participants: {
    orderBy: {
      createdAt: "asc"
    }
  },
  availabilities: {
    where: {
      isAvailable: true
    },
    orderBy: [{ date: "asc" }, { slotKey: "asc" }]
  }
} satisfies Prisma.EventInclude;

export async function getEventByToken(token: string) {
  return prisma.event.findUnique({
    where: { shareToken: token },
    include: eventInclude
  });
}

type EventWithRelations = NonNullable<Awaited<ReturnType<typeof getEventByToken>>>;

export function buildEventViewModel(event: EventWithRelations) {
  const dates = enumerateDates(event.startDate, event.endDate);
  const participantCount = event.participants.length;
  const counts = new Map<string, number>();
  const participantSelections = new Map<number, Set<string>>();

  for (const availability of event.availabilities) {
    const dateKey = toDateOnlyString(availability.date);
    const cellKey = `${dateKey}:${availability.slotKey}`;
    counts.set(cellKey, (counts.get(cellKey) ?? 0) + 1);

    const selections = participantSelections.get(availability.participantId) ?? new Set<string>();
    selections.add(cellKey);
    participantSelections.set(availability.participantId, selections);
  }

  const grid = dates.flatMap((date) =>
    SLOT_CONFIG.map((slot) => {
      const dateKey = toDateOnlyString(date);
      const cellKey = `${dateKey}:${slot.key}`;
      const availableCount = counts.get(cellKey) ?? 0;
      const isAllAvailable = participantCount > 0 && availableCount === participantCount;

      return {
        key: cellKey,
        dateKey,
        slotKey: slot.key,
        slotLabel: slot.label,
        slotTime: slot.time,
        dateLabel: formatDisplayDate(date),
        availableCount,
        isAllAvailable
      };
    })
  );

  const bestCount = grid.reduce((max, item) => Math.max(max, item.availableCount), 0);
  const bestSlots = grid.filter((item) => item.availableCount > 0 && item.availableCount === bestCount);
  const allAvailableSlots = grid.filter((item) => item.isAllAvailable);

  const rankedSlots = [...grid].sort((a, b) => {
    if (a.isAllAvailable !== b.isAllAvailable) {
      return a.isAllAvailable ? -1 : 1;
    }

    if (b.availableCount !== a.availableCount) {
      return b.availableCount - a.availableCount;
    }

    if (a.dateKey !== b.dateKey) {
      return a.dateKey.localeCompare(b.dateKey);
    }

    const orderA = SLOT_CONFIG.find((slot) => slot.key === a.slotKey)?.order ?? 99;
    const orderB = SLOT_CONFIG.find((slot) => slot.key === b.slotKey)?.order ?? 99;
    return orderA - orderB;
  });

  const finalizedKey =
    event.finalizedDate && event.finalizedSlotKey
      ? `${toDateOnlyString(event.finalizedDate)}:${event.finalizedSlotKey}`
      : null;

  return {
    event,
    participantCount,
    dateKeys: dates.map(toDateOnlyString),
    participants: event.participants.map((participant) => ({
      id: participant.id,
      nickname: participant.nickname,
      selectedKeys: [...(participantSelections.get(participant.id) ?? new Set<string>())]
    })),
    grid,
    bestSlots,
    allAvailableSlots,
    rankedSlots,
    finalizedSlot: finalizedKey ? grid.find((item) => item.key === finalizedKey) ?? null : null
  };
}

export async function getParticipantSelection(eventId: number, nickname: string) {
  const participant = await prisma.participant.findUnique({
    where: {
      eventId_nickname: {
        eventId,
        nickname
      }
    },
    include: {
      availabilities: {
        where: {
          isAvailable: true
        }
      }
    }
  });

  if (!participant) {
    return null;
  }

  return {
    id: participant.id,
    nickname: participant.nickname,
    selections: participant.availabilities.map((item) => ({
      date: toDateOnlyString(item.date),
      slotKey: item.slotKey
    }))
  };
}
