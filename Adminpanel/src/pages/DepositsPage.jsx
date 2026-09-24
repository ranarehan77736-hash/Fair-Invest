import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'
import { API_BASE } from '../lib/api.js'

const options = ['pending', 'completed', 'rejected']
const toAssetUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

function DepositsPage() {
  const { deposits, users, updateDepositStatus, deleteDeposit, getUserOverview } = useAdmin()
  const navigate = useNavigate()
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [selectedUserOverview, setSelectedUserOverview] = useState(null)
  const userById = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!selectedDeposit?.userId) {
        setSelectedUserOverview(null)
        return
      }
      try {
        const detail = await getUserOverview(selectedDeposit.userId)
        if (!cancelled) setSelectedUserOverview(detail)
      } catch {
        if (!cancelled) setSelectedUserOverview(null)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [selectedDeposit, getUserOverview])

  const updateStatus = async (id, status) => {
    try {
      await updateDepositStatus(id, status)
      toast.success('Deposit status updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pending deposit request?')) return
    try {
      await deleteDeposit(id)
      toast.success('Deposit deleted')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Deposits</h2>
        <p>Approve or reject incoming deposit requests with proof and account details.</p>
      </header>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Proof</th>
              <th>Status</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((item) => (
              <tr key={item.id} className="user-row-clickable" onClick={() => setSelectedDeposit(item)}>
                <td>{item.id}</td>
                <td>{item.userName || userById.get(Number(item.userId))?.name || `User #${item.userId}`}</td>
                <td>{item.paymentAccountName || item.method}</td>
                <td>${Number(item.amount).toFixed(2)}</td>
                <td>
                  {item.proofPath ? (
                    <a href={toAssetUrl(item.proofPath)} target="_blank" rel="noreferrer">
                      <img src={toAssetUrl(item.proofPath)} alt="proof" width={64} height={44} />
                    </a>
                  ) : (
                    'Missing'
                  )}
                </td>
                <td>{item.status}</td>
                <td>
                  <select
                    defaultValue={item.status}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(e) => updateStatus(item.id, e.target.value)}
                  >
                    {options.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="mini-btn danger-inline"
                    disabled={item.status !== 'pending'}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDelete(item.id)
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDeposit ? (
        <div className="record-modal" onClick={() => setSelectedDeposit(null)}>
          <div className="record-modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="user-overview-head">
            <div>
              <h3>Deposit Detail #{selectedDeposit.id}</h3>
              <p className="muted">
                User: {selectedDeposit.userName || userById.get(Number(selectedDeposit.userId))?.name || '-'} | Email:{' '}
                {selectedDeposit.userEmail || userById.get(Number(selectedDeposit.userId))?.email || '-'}
              </p>
            </div>
            <div className="plan-actions">
              <button
                className="mini-btn"
                onClick={() => {
                  navigate(`/users?openUser=${selectedDeposit.userId}`)
                }}
              >
                Open in Users Manager
              </button>
              <button className="mini-btn" onClick={() => setSelectedDeposit(null)}>
                Close Detail
              </button>
            </div>
          </div>
          <div className="user-overview-grid">
            <div className="user-overview-tile">
              <strong>Deposit Request</strong>
              <p>Amount: ${Number(selectedDeposit.amount || 0).toFixed(2)}</p>
              <p>Method: {selectedDeposit.method}</p>
              <p>Account: {selectedDeposit.paymentAccountName || '-'}</p>
              <p>Status: {selectedDeposit.status}</p>
              <p>Reference: {selectedDeposit.reference || '-'}</p>
              <p>Date: {String(selectedDeposit.createdAt || '').slice(0, 19).replace('T', ' ') || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>User Info</strong>
              <p>Name: {selectedDeposit.userName || userById.get(Number(selectedDeposit.userId))?.name || '-'}</p>
              <p>Email: {selectedDeposit.userEmail || userById.get(Number(selectedDeposit.userId))?.email || '-'}</p>
              <p>Phone: {selectedDeposit.userPhone || userById.get(Number(selectedDeposit.userId))?.phone || '-'}</p>
              <p>Country: {userById.get(Number(selectedDeposit.userId))?.country || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>Proof</strong>
              {selectedDeposit.proofPath ? (
                <a href={toAssetUrl(selectedDeposit.proofPath)} target="_blank" rel="noreferrer">
                  <img className="detail-proof-image" src={toAssetUrl(selectedDeposit.proofPath)} alt="deposit proof" />
                </a>
              ) : (
                <p>Proof not uploaded</p>
              )}
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
              <p>Deposit locked for investment use: Yes</p>
            </div>
          </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default DepositsPage
