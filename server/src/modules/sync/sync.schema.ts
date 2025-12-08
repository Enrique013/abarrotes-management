import { z } from 'zod';

/**
 * Schema para crear un log de sincronización
 */
export const createSyncLogSchema = z.object({
    entityType: z.enum(['VISIT', 'ORDER', 'PHOTO']),
    entityId: z.string().cuid(),
    action: z.enum(['CREATE', 'UPDATE']),
    status: z.enum(['success', 'failed', 'conflict_resolved']).optional(),
    details: z.any().optional()
});

/**
 * Schema para query params de búsqueda de logs
 */
export const getSyncLogsQuerySchema = z.object({
    userId: z.string().cuid().optional(),
    entityType: z.enum(['VISIT', 'ORDER', 'PHOTO']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});

/**
 * Schema para query params de estadísticas
 */
export const getSyncStatisticsQuerySchema = z.object({
    userId: z.string().cuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});

export type CreateSyncLogInput = z.infer<typeof createSyncLogSchema>;
export type GetSyncLogsQuery = z.infer<typeof getSyncLogsQuerySchema>;
export type GetSyncStatisticsQuery = z.infer<typeof getSyncStatisticsQuerySchema>;
