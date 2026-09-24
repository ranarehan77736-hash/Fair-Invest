import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

const statusOptions = ['pending', 'processing', 'completed', 'failed', 'active']

function TransactionsPage() {
  const { transactions, users, updateTransactionStatus, getUserOverview } = useAdmin()
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)
  const [selectedUserOverview, setSelectedUserOverview] = useState(null)
  const userById = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!selectedTx?.userId) {
        setSelectedUserOverview(null)
        return
      }
      try {
        const detail = await getUserOverview(selectedTx.userId)
        if (!cancelled) setSelectedUserOverview(detail)
      } catch {
        if (!cancelled) setSelectedUserOverview(null)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [selectedTx, getUserOverview])

  const rows = useMemo(
    () =>
      transactions.filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false
        return true
      }),
    [transactions, typeFilter, statusFilter],
  )

  const onStatusChange = async (id, status) => {
    try {
      await updateTransactionStatus(id, status)
      toast.success('Transaction updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Transactions</h2>
        <p>Review and moderate recent transactions with filters.</p>
        <div className="plan-actions">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="investment">Investment</option>
            <option value="earning">Earning</option>
            <option value="commission">Commission</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="user-row-clickable" onClick={() => setSelectedTx(tx)}>
                <td>{tx.id}</td>
                <td>{tx.userName || userById.get(Number(tx.userId))?.name || `User #${tx.userId}`}</td>
                <td>{tx.type}</td>
                <td>{tx.method || '-'}</td>
                <td>${Number(tx.amount).toFixed(2)}</td>
                <td>{tx.status}</td>
                <td>{tx.reference || '-'}</td>
                <td>
                  <select
                    defaultValue={tx.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(e) => onStatusChange(tx.id, e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTx ? (
        <div className="record-modal" onClick={() => setSelectedTx(null)}>
          <div className="record-modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="user-overview-head">
            <div>
              <h3>Transaction Detail #{selectedTx.id}</h3>
              <p className="muted">
                User: {selectedTx.userName || userById.get(Number(selectedTx.userId))?.name || '-'} | Email:{' '}
                {selectedTx.userEmail || userById.get(Number(selectedTx.userId))?.email || '-'}
              </p>
            </div>
            <div className="plan-actions">
              <button
                className="mini-btn"
                onClick={() => {
                  navigate(`/users?openUser=${selectedTx.userId}`)
                }}
              >
                Open in Users Manager
              </button>
              <button className="mini-btn" onClick={() => setSelectedTx(null)}>
                Close Detail
              </button>
            </div>
          </div>
          <div className="user-overview-grid">
            <div className="user-overview-tile">
              <strong>Request Info</strong>
              <p>ID: {selectedTx.id}</p>
              <p>Type: {selectedTx.type}</p>
              <p>Method: {selectedTx.method || '-'}</p>
              <p>Status: {selectedTx.status}</p>
              <p>Amount: ${Number(selectedTx.amount || 0).toFixed(2)}</p>
              <p>Reference: {selectedTx.reference || '-'}</p>
              <p>Date: {String(selectedTx.createdAt || '').slice(0, 19).replace('T', ' ') || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>User Info</strong>
              <p>Name: {selectedTx.userName || userById.get(Number(selectedTx.userId))?.name || '-'}</p>
              <p>Email: {selectedTx.userEmail || userById.get(Number(selectedTx.userId))?.email || '-'}</p>
              <p>Phone: {selectedTx.userPhone || userById.get(Number(selectedTx.userId))?.phone || '-'}</p>
              <p>Country: {userById.get(Number(selectedTx.userId))?.country || '-'}</p>
              <p>Role: {userById.get(Number(selectedTx.userId))?.role || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>Investment Context</strong>
              <p>Active investments: {selectedUserOverview?.investments?.filter((i) => i.status === 'active').length || 0}</p>
              <p>
                Active amount: $
                {(
                  (selectedUserOverview?.investments || [])
                    .filter((i) => i.status === 'active')
                    .reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0
                ).toFixed(2)}
              </p>
              <p>Locked funds: ${Number(selectedUserOverview?.user?.lockedBalance || 0).toFixed(2)}</p>
              <p>
                Withdrawable: $
                {Math.max(
                  0,
                  Number(selectedUserOverview?.user?.walletBalance || 0) -
                    Number(selectedUserOverview?.user?.lockedBalance || 0),
                ).toFixed(2)}
              </p>
            </div>
          </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TransactionsPage
