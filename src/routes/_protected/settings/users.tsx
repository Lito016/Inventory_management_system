import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { PageContainer } from '@/components/layout/PageContainer';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { handleSupabaseError } from '@/lib/utils/api-errors';
import { formatDate } from '@/lib/utils/dates';
import type { ColumnDef } from '@/components/ui/Table';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  staff: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const ACTIVE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Inactive: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
};

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { email: '', password: '', full_name: '', role: 'staff' as 'admin' | 'staff' },
  });

  const columns: ColumnDef<Profile>[] = [
    { key: 'full_name', header: 'Name', render: (r) => <span className="font-medium">{r.full_name}</span> },
    { key: 'email', header: 'Email', render: (r) => r.email },
    { key: 'role', header: 'Role', render: (r) => <Badge status={r.role} colorMap={ROLE_COLORS} /> },
    { key: 'is_active', header: 'Status', render: (r) => <Badge status={r.is_active ? 'Active' : 'Inactive'} colorMap={ACTIVE_COLORS} /> },
    { key: 'created_at', header: 'Joined', render: (r) => formatDate(r.created_at) },
    { key: 'actions', header: '', render: (r) => (
      <Button variant="ghost" size="sm" onClick={() => supabase.from('profiles').update({ is_active: !r.is_active }).eq('id', r.id).then(() => refetch())}>
        {r.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  async function onSubmit(data: { email: string; password: string; full_name: string; role: 'admin' | 'staff' }) {
    setFormError('');
    setSuccessMsg('');
    try {
      // Create auth user via Supabase Admin (requires service role - use invite instead)
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.full_name, role: data.role } },
      });
      if (authError) throw authError;

      // Update profile
      const { data: profileData } = await supabase.from('profiles').select('id').eq('email', data.email).single();
      if (profileData) {
        await supabase.from('profiles').update({ full_name: data.full_name, role: data.role }).eq('id', profileData.id);
      }

      setSuccessMsg(`User ${data.email} created. They will receive an email to confirm.`);
      setCreateOpen(false);
      reset();
      refetch();
    } catch (err) {
      setFormError(handleSupabaseError(err));
    }
  }

  return (
    <PageContainer title="User Management" actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add User</Button>}>
      {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">{successMsg}</div>}
      <Table columns={columns} data={users ?? []} loading={isLoading} emptyMessage="No users found." />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New User"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Create User</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{formError}</div>}
          <Input label="Full Name *" required {...register('full_name', { required: 'Required' })} />
          <Input label="Email *" type="email" required {...register('email', { required: 'Required' })} />
          <Input label="Password *" type="password" required minLength={6} {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select {...register('role')} className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm">
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
