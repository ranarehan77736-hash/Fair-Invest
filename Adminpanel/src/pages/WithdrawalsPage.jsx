import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

const options = ['pending', 'processing', 'completed', 'rejected']

const METHOD_LABELS = {
  bank_transfer: 'Bank Transfer',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash',
  nayapay: 'NayaPay',
  sadapay: 'SadaPay',
  digit_plus: 'Digit Plus',
  crypto: 'Crypto',
}

function getWithdrawalAccountInfo(item = {}) {
  const details = item.accountDetails || {}
  const method = String(item.method || '').toLowerCase()
  const isCrypto = method === 'crypto'
  const bankName =
    details.selectedPayoutAccountName ||
    details.bankName ||
    METHOD_LABELS[method] ||
    ''
  const accountHolder = details.accountTitle || '-'
  const accountNumber = isCrypto
    ? details.walletAddress || details.accountNumber || '-'
    : details.accountNumber || details.walletAddress || '-'

  return {
    bankName: bankName || (isCrypto ? 'Crypto Wallet' : '-'),
    accountHolder,
    accountNumber,
    isCrypto,
  }
}

function WithdrawalsPage() {
  const { withdrawals, users, updateWithdrawalStatus, getUserOverview } = useAdmin()
  const navigate = useNavigate()
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [selectedUserOverview, setSelectedUserOverview] = useState(null)
  const [stagedStatusById, setStagedStatusById] = useState({})
  const [statusDialog, setStatusDialog] = useState(null)
  const userById = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!selectedWithdrawal?.userId) {
        setSelectedUserOverview(null)
        return
      }
      try {
        const detail = await getUserOverview(selectedWithdrawal.userId)
        if (!cancelled) setSelectedUserOverview(detail)
      } catch {
        if (!cancelled) setSelectedUserOverview(null)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [selectedWithdrawal, getUserOverview])

  const openStatusDialog = (item) => {
    const nextStatus = stagedStatusById[item.id] ?? item.status
    if (nextStatus === item.status) {
      toast.info('Select a different status first')
      return
    }
    const requestedTotal = Number(item.amount || 0) + Number(item.fee || 0)
    setStatusDialog({
      item,
      status: nextStatus,
      approvedAmount: requestedTotal.toFixed(2),
      reason: '',
    })
  }

  const saveStatus = async () => {
    if (!statusDialog?.item) return
    const { item, status, reason } = statusDialog
    try {
      let payload = { status }
      if (status === 'completed') {
        const requestedTotal = Number(item.amount || 0) + Number(item.fee || 0)
        const approvedAmount = Number(statusDialog.approvedAmount)
        if (!Number.isFinite(approvedAmount)) {
          toast.error('Please enter a valid payout amount')
          return
        }
        if (approvedAmount < 0 || approvedAmount > requestedTotal) {
          toast.error(`Payout amount must be between 0 and ${requestedTotal.toFixed(2)}`)
          return
        }
        const refundAmount = Number((requestedTotal - approvedAmount).toFixed(2))
        payload = {
          status,
          approvedAmount,
          refundAmount,
          reason,
        }
      } else if (status === 'rejected') {
        payload = { status, reason }
      } else if (reason) {
        payload = { status, reason }
      }
      await updateWithdrawalStatus(item.id, payload)
      setStagedStatusById((prev) => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
      setStatusDialog(null)
      toast.success('Withdrawal status updated')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <section className="panel-grid">
      <header className="panel-head">
        <h2>Withdrawals</h2>
        <p>Handle withdrawal lifecycle, including partial payouts with automatic refund of remaining amount.</p>
      </header>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Fee</th>
              <th>Bank / Account</th>
              <th>Status</th>
              <th>Settlement</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => {
              const accountInfo = getWithdrawalAccountInfo(item)
              return (
              <tr key={item.id} className="user-row-clickable" onClick={() => setSelectedWithdrawal(item)}>
                <td>{item.id}</td>
                <td>{item.userName || userById.get(Number(item.userId))?.name || `User #${item.userId}`}</td>
                <td>{item.method}</td>
                <td>${Number(item.amount).toFixed(2)}</td>
                <td>${Number(item.fee).toFixed(2)}</td>
                <td>
                  <div><strong>{accountInfo.bankName}</strong></div>
                  <div>{accountInfo.accountHolder}</div>
                  <small>{accountInfo.accountNumber}</small>
                </td>
                <td>{item.status}</td>
                <td>
                  {item.status === 'completed' ? (
                    <small>
                      Paid: ${Number(item.approvedAmount || 0).toFixed(2)} | Refund: $
                      {Number(item.refundAmount || 0).toFixed(2)}
                    </small>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className="row-action-group">
                    <select
                      value={stagedStatusById[item.id] ?? item.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(e) =>
                        setStagedStatusById((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                    >
                      {options.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="mini-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        openStatusDialog(item)
                      }}
                      disabled={(stagedStatusById[item.id] ?? item.status) === item.status}
                    >
                      Save
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {selectedWithdrawal ? (() => {
        const accountInfo = getWithdrawalAccountInfo(selectedWithdrawal)
        return (
        <div className="record-modal" onClick={() => setSelectedWithdrawal(null)}>
          <div className="record-modal-card" onClick={(event) => event.stopPropagation()}>
          <div className="user-overview-head">
            <div>
              <h3>Withdrawal Detail #{selectedWithdrawal.id}</h3>
              <p className="muted">
                User: {selectedWithdrawal.userName || userById.get(Number(selectedWithdrawal.userId))?.name || '-'} | Email:{' '}
                {selectedWithdrawal.userEmail || userById.get(Number(selectedWithdrawal.userId))?.email || '-'}
              </p>
            </div>
            <div className="plan-actions">
              <button
                className="mini-btn"
                onClick={() => {
                  navigate(`/users?openUser=${selectedWithdrawal.userId}`)
                }}
              >
                Open in Users Manager
              </button>
              <button className="mini-btn" onClick={() => setSelectedWithdrawal(null)}>
                Close Detail
              </button>
            </div>
          </div>

          <div className="user-overview-grid">
            <div className="user-overview-tile">
              <strong>Withdrawal Request</strong>
              <p>Amount: ${Number(selectedWithdrawal.amount || 0).toFixed(2)}</p>
              <p>Fee: ${Number(selectedWithdrawal.fee || 0).toFixed(2)}</p>
              <p>Method: {selectedWithdrawal.method}</p>
              <p>Status: {selectedWithdrawal.status}</p>
              <p>Reference: {selectedWithdrawal.reference || '-'}</p>
              <p>Reason: {selectedWithdrawal.adminReason || '-'}</p>
              <p>Date: {String(selectedWithdrawal.createdAt || '').slice(0, 19).replace('T', ' ') || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>User Info</strong>
              <p>Name: {selectedWithdrawal.userName || userById.get(Number(selectedWithdrawal.userId))?.name || '-'}</p>
              <p>Email: {selectedWithdrawal.userEmail || userById.get(Number(selectedWithdrawal.userId))?.email || '-'}</p>
              <p>Phone: {selectedWithdrawal.userPhone || userById.get(Number(selectedWithdrawal.userId))?.phone || '-'}</p>
              <p>Country: {userById.get(Number(selectedWithdrawal.userId))?.country || '-'}</p>
            </div>
            <div className="user-overview-tile">
              <strong>Account & Settlement</strong>
              <p>Bank / Wallet: {accountInfo.bankName}</p>
              <p>Account Holder: {accountInfo.accountHolder}</p>
              <p>
                {accountInfo.isCrypto ? 'Wallet Address' : 'Account Number'}: {accountInfo.accountNumber}
              </p>
              <p>Approved: ${Number(selectedWithdrawal.approvedAmount || 0).toFixed(2)}</p>
              <p>Refund: ${Number(selectedWithdrawal.refundAmount || 0).toFixed(2)}</p>
            </div>
            <div className="user-overview-tile">
              <strong>Investment Source Context</strong>
              <p>Active investments: {selectedUserOverview?.investments?.filter((i) => i.status === 'active').length || 0}</p>
              <p>
                Active amount: $
                {(
                  (selectedUserOverview?.investments || [])
                    .filter((i) => i.status === 'active')
                    .reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0
                ).toFixed(2)}
              </p>
              <p>Wallet balance: ${Number(selectedUserOverview?.user?.walletBalance || 0).toFixed(2)}</p>
              <p>Locked deposit funds: ${Number(selectedUserOverview?.user?.lockedBalance || 0).toFixed(2)}</p>
              <p>
                Withdrawable before this request: $
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
        )
      })() : null}

      {statusDialog ? (
        <div className="record-modal" onClick={() => setStatusDialog(null)}>
          <div className="record-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="user-overview-head">
              <div>
                <h3>Confirm Withdrawal Update</h3>
                <p className="muted">
                  Request #{statusDialog.item.id} | New status: <strong>{statusDialog.status}</strong>
                </p>
              </div>
              <div className="plan-actions">
                <button className="mini-btn" onClick={() => setStatusDialog(null)}>
                  Cancel
                </button>
              </div>
            </div>
            <div className="user-overview-grid">
              <div className="user-overview-tile">
                <strong>Request Summary</strong>
                <p>Amount: ${Number(statusDialog.item.amount || 0).toFixed(2)}</p>
                <p>Fee: ${Number(statusDialog.item.fee || 0).toFixed(2)}</p>
                <p>Total debit: ${(Number(statusDialog.item.amount || 0) + Number(statusDialog.item.fee || 0)).toFixed(2)}</p>
              </div>
              {statusDialog.status === 'completed' ? (
                <div className="user-overview-tile">
                  <strong>Partial Payout</strong>
                  <label>Payout amount now</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={statusDialog.approvedAmount}
                    onChange={(e) =>
                      setStatusDialog((prev) => ({
                        ...prev,
                        approvedAmount: e.target.value,
                      }))
                    }
                  />
                  <p className="muted small">
                    Refund to wallet: $
                    {Math.max(
                      0,
                      Number(
                        (
                          Number(statusDialog.item.amount || 0) +
                          Number(statusDialog.item.fee || 0) -
                          Number(statusDialog.approvedAmount || 0)
                        ).toFixed(2),
                      ),
                    ).toFixed(2)}
                  </p>
                </div>
              ) : null}
              <div className="user-overview-tile">
                <strong>Reason (optional)</strong>
                <textarea
                  rows={4}
                  placeholder="Reason or notes for this status update"
                  value={statusDialog.reason}
                  onChange={(e) =>
                    setStatusDialog((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="plan-actions">
              <button className="primary-btn" onClick={saveStatus}>
                Done / Save
              </button>
              <button className="mini-btn" onClick={() => setStatusDialog(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default WithdrawalsPage
