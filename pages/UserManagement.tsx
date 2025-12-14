import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Role } from '../types';
import { Card, Input, Button } from '../components/UIComponents';
import { Modal } from '../components/Modal';
import { Shield, User as UserIcon, RefreshCw, Plus } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as Role,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.username || !newUser.password) return;

    try {
      await api.createUser(newUser);
      setNewUser({ name: '', username: '', password: '', role: 'user' });
      setIsCreateModalOpen(false);
      loadUsers();
    } catch {
      alert('Failed to create user (Username might exist)');
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Reset password to "1234"?')) return;

    try {
      await api.resetPassword(id);
      alert('Password reset to 1234');
    } catch {
      alert('Failed to reset password');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-500">
            Create new accounts and manage access.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add User
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-8">Loading users...</p>
        ) : (
          users.map(u => (
            <Card
              key={u.id}
              className="flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      u.role === 'developer'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {u.role === 'developer' ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {u.name || u.username}
                    </h3>
                    {u.name && (
                      <p className="text-xs text-slate-400">
                        @{u.username}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 capitalize mt-1">
                      {u.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">
                  ID: {u.id.substring(0, 8)}...
                </span>

                <Button
                  variant="ghost"
                  className="text-xs h-8 px-2"
                  onClick={() => handleResetPassword(u.id)}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset Pass
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create User Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Input
            label="Name (Optional)"
            value={newUser.name}
            onChange={e =>
              setNewUser({ ...newUser, name: e.target.value })
            }
          />

          <Input
            label="Username"
            value={newUser.username}
            onChange={e =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={e =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              value={newUser.role}
              onChange={e =>
                setNewUser({
                  ...newUser,
                  role: e.target.value as Role,
                })
              }
            >
              <option value="user">User</option>
              <option value="developer">Developer</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
