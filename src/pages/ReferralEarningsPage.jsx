import { useAppContext } from '../context/AppContext.jsx'

function ReferralEarningsPage() {
  const { referralCount, referralEarnings, user, referralEntries } = useAppContext()
  const earningsRows = referralEntries.map((item) => ({
    source: item.sourceUserName,
    commission: Number(item.amount || 0),
    status: item.status || 'completed',
  }))

  return (
    <section className="page-grid">
      <div className="metrics-grid">
        <article className="glass-card metric success">
          <p className="muted">Total Referral Earnings</p>
          <h3>${referralEarnings.toFixed(2)}</h3>
        </article>
        <article className="glass-card metric info">
          <p className="muted">Total Referrals</p>
          <h3>{referralCount}</h3>
        </article>
        <article className="glass-card metric neutral">
          <p className="muted">Your Referral Code</p>
          <h3>{user.referralCode}</h3>
        </article>
      </div>

      <div className="glass-card">
        <h3>Commission Breakdown</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Referral</th>
                <th>Commission</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {earningsRows.length ? earningsRows.map((row) => (
                <tr key={row.source}>
                  <td>{row.source}</td>
                  <td>${row.commission.toFixed(2)}</td>
                  <td>
                    <span className={`status ${row.status}`}>{row.status}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3">No referral earnings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ReferralEarningsPage
