'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUsers, deleteUser } from '../../lib/api';
import type { UserResponse, Pagination } from '@user-management-system/types';

export default function Admin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/sessions/profile');
      if (!res.data.success) {
        router.push('/register');
        return;
      }
    } catch {
      router.push('/register');
      return;
    } finally {
      setCheckingAuth(false);
    }
  }

  async function loadUsers(page: number) {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers(page, 6);
      if (res.success) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mounted && !checkingAuth) {
      loadUsers(1);
    }
  }, [mounted, checkingAuth]);

  async function handleDeleteConfirm() {
    if (!deleteUserId) return;

    setDeleting(true);
    try {
      const res = await deleteUser(deleteUserId);
      if (res.success) {
        loadUsers(pagination?.page || 1);
        setDeleteUserId(null);
      } else {
        setError(res.message || 'Failed to delete user');
      }
    } catch {
      setError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  }

  if (!mounted || checkingAuth) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <a href="/admin/create" className="btn btn-primary">
          + Create User
        </a>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="hero min-h-[40vh]">
          <div className="hero-content text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="alert alert-info">
          <span>No users found</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-lg">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.creationTime).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`/admin/edit/${user._id}`} className="btn btn-ghost btn-xs">
                          ✏️
                        </a>
                        <button
                          onClick={() => setDeleteUserId(user._id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                className="btn btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => loadUsers(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadUsers(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {deleteUserId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete User</h3>
            <p className="py-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button onClick={() => setDeleteUserId(null)} className="btn" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-error" disabled={deleting}>
                {deleting ? <span className="loading loading-spinner loading-sm"></span> : 'Delete'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteUserId(null)}>close</button>
          </form>
        </div>
      )}
    </div>
  );
}
