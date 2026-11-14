import { createClient } from './supabase/client';

export interface LogAuditParams {
  adminId: string;
  adminEmail: string;
  action: string;
  targetTable: string;
  targetId?: string | null;
  details?: Record<string, any>;
}

export async function recordAuditLog({
  adminId,
  adminEmail,
  action,
  targetTable,
  targetId,
  details = {},
}: LogAuditParams) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('admin_audit_logs').insert([
      {
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        target_table: targetTable,
        target_id: targetId || null,
        details,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('Could not record audit log to database:', error.message);
    }
  } catch (err) {
    console.error('Audit log exception:', err);
  }
}

