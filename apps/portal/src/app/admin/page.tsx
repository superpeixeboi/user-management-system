'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUsers, UserListItem, Pagination } from '../../lib/api';

export default function Admin() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

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
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
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
    </div>
  );
}
