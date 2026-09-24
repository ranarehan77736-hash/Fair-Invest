import { FiCopy, FiGift, FiLink2, FiShare2, FiUsers } from 'react-icons/fi'
import { RiCheckboxCircleFill, RiUserAddLine, RiMoneyDollarCircleLine } from 'react-icons/ri'
import { toast } from 'sonner'
import { useAppContext } from '../context/AppContext.jsx'

function ReferralTreePage() {
  const {
    user,
    referralCount,
    directReferralCount,
    indirectReferralCount,
    referralEarnings,
    referralTree,
    referralEntries,
    commissionStructure,
  } =
    useAppContext()
  const referralLink = `https://horizoneinvest.com/signup?ref=${user.referralCode}`
  const stats = [
    { label: 'Total Referrals', value: referralCount, icon: FiUsers, tone: 'emerald' },
    {
      label: 'Active Referrals',
      value: referralTree.filter((item) => Number(item.level) === 1).length,
      icon: RiUserAddLine,
      tone: 'cyan',
    },
    {
      label: 'Total Earnings',
      value: `$${Number(referralEarnings).toFixed(2)}`,
      icon: RiMoneyDollarCircleLine,
      tone: 'violet',
    },
    {
      label: 'This Month',
      value: `$${Number(
        referralEntries
          .filter((entry) => String(entry.createdAt || '').slice(0, 7) === new Date().toISOString().slice(0, 7))
          .reduce((acc, entry) => acc + Number(entry.amount || 0), 0),
      ).toFixed(2)}`,
      icon: FiGift,
      tone: 'pink',
    },
  ]

  const commissionLevels = commissionStructure.map((item, index) => {
    const members = referralTree.filter((entry) => Number(entry.level) === Number(item.level)).length
    const earnings = referralEntries
      .filter((entry) => Number(entry.ratePercent) === Number(item.ratePercent))
      .reduce((acc, entry) => acc + Number(entry.amount || 0), 0)
    return {
      level: `L${item.level}`,
      members,
      rate: `${item.ratePercent}%`,
      earnings: `$${earnings.toFixed(2)}`,
      tone: index === 0 ? 'emerald' : index === 1 ? 'cyan' : 'violet',
    }
  })

  const recentReferrals = referralTree.slice(0, 5).map((entry) => {
    const amount = referralEntries
      .filter((item) => item.sourceUserName === entry.name)
      .reduce((acc, item) => acc + Number(item.amount || 0), 0)
    const initials = String(entry.name || '')
      .split(' ')
      .map((part) => part[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase()
    return {
      initials,
      name: entry.name,
      meta: `Level ${entry.level} • ${String(entry.joinedAt || '').slice(0, 10)}`,
      earning: `$${amount.toFixed(2)}`,
      status: 'Active',
    }
  })
  const directReferrals = referralTree.filter((entry) => Number(entry.level) === 1)
  const indirectReferrals = referralTree.filter((entry) => Number(entry.level) > 1)

  const copyText = async (value) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied to clipboard')
  }

  return (
    <section className="page-grid referral-page mobile-friendly-page">
      <div className="glass-card referral-hero">
        <span className="pill-badge violet">
          <FiGift size={14} /> Referral Program
        </span>
        <h2 className="page-title">Refer & Earn Commission</h2>
        <p className="muted">
          Share your referral link and earn up to 10% commission on every investment.
        </p>
      </div>

      <div className="ref-stats-grid">
        {stats.map((item) => (
          <article key={item.label} className={`glass-card ref-stat-card ${item.tone}`}>
            <span className="ref-stat-icon">
              <item.icon size={18} />
            </span>
            <p className="muted">{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>

      <div className="glass-card referral-link-card">
        <h3>
          <FiShare2 size={16} /> Your Referral Link
        </h3>
        <div className="ref-share-row">
          <div className="ref-share-box">
            <p className="muted small">Referral Code</p>
            <code>{user.referralCode}</code>
          </div>
          <button className="btn btn-primary" onClick={() => copyText(user.referralCode)}>
            <FiCopy size={14} /> Copy Code
          </button>
        </div>
        <div className="ref-share-row">
          <div className="ref-share-box">
            <p className="muted small">Referral Link</p>
            <code>{referralLink}</code>
          </div>
          <button className="btn btn-cyan" onClick={() => copyText(referralLink)}>
            <FiLink2 size={14} /> Copy Link
          </button>
        </div>
        <div className="ref-social-row">
          <button className="btn btn-outline">Share on Facebook</button>
          <button className="btn btn-outline">Share on Twitter</button>
        </div>
      </div>

      <div className="glass-card ref-commission-card">
        <h3>Commission Structure</h3>
        <div className="level-list">
          {commissionLevels.map((level) => (
            <article key={level.level} className="level-row">
              <div className={`level-badge ${level.tone}`}>{level.level}</div>
              <div>
                <p className="muted small">Members</p>
                <strong>{level.members}</strong>
              </div>
              <div>
                <p className="muted small">Commission Rate</p>
                <strong className="rate">{level.rate}</strong>
              </div>
              <div>
                <p className="muted small">Total Earnings</p>
                <strong>{level.earnings}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="glass-card ref-commission-card">
        <h3>Direct & Indirect Referral Record</h3>
        <div className="level-list">
          <article className="level-row">
            <div className="level-badge emerald">Direct</div>
            <div>
              <p className="muted small">Total Members</p>
              <strong>{directReferralCount || directReferrals.length}</strong>
            </div>
            <div>
              <p className="muted small">Indirect Members</p>
              <strong>{indirectReferralCount || indirectReferrals.length}</strong>
            </div>
            <div>
              <p className="muted small">Total Network</p>
              <strong>{referralCount}</strong>
            </div>
          </article>
        </div>
        <div className="mobile-record-list" style={{ marginTop: '1rem' }}>
          {[...directReferrals, ...indirectReferrals].slice(0, 50).length ? (
            [...directReferrals, ...indirectReferrals].slice(0, 50).map((entry) => (
              <article key={`${entry.id}-${entry.level}-card`} className="mobile-record-card">
                <div className="mobile-record-row">
                  <span className="muted small">User</span>
                  <strong>{entry.username || entry.name}</strong>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Email</span>
                  <span>{entry.email}</span>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Level</span>
                  <strong>{Number(entry.level) === 1 ? 'Direct' : `L${entry.level}`}</strong>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Deposits</span>
                  <span>
                    ${Number(entry.totalDeposits || 0).toFixed(2)} ({entry.completedDepositCount || 0} tx)
                  </span>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Withdrawals</span>
                  <span>
                    ${Number(entry.totalWithdrawals || 0).toFixed(2)} ({entry.completedWithdrawalCount || 0} tx)
                  </span>
                </div>
                <div className="mobile-record-row">
                  <span className="muted small">Invested</span>
                  <span>
                    ${Number(entry.totalInvested || 0).toFixed(2)} · {entry.investmentCount || 0} inv.
                  </span>
                </div>
              </article>
            ))
          ) : (
            <p className="muted">No direct/indirect referrals yet.</p>
          )}
        </div>

        <div className="table-wrap table-wrap--desktop" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Level</th>
                <th>Deposits</th>
                <th>Withdrawals</th>
                <th>Invested</th>
              </tr>
            </thead>
            <tbody>
              {[...directReferrals, ...indirectReferrals].slice(0, 50).map((entry) => (
                <tr key={`${entry.id}-${entry.level}`}>
                  <td>{entry.username || entry.name}</td>
                  <td>{entry.email}</td>
                  <td>{Number(entry.level) === 1 ? 'Direct' : `L${entry.level}`}</td>
                  <td>
                    ${Number(entry.totalDeposits || 0).toFixed(2)}
                    <span className="muted small">
                      {' '}
                      ({Number(entry.completedDepositCount || 0)} tx)
                    </span>
                  </td>
                  <td>
                    ${Number(entry.totalWithdrawals || 0).toFixed(2)}
                    <span className="muted small">
                      {' '}
                      ({Number(entry.completedWithdrawalCount || 0)} tx)
                    </span>
                  </td>
                  <td>
                    ${Number(entry.totalInvested || 0).toFixed(2)}
                    <span className="muted small">
                      {' '}
                      · {Number(entry.investmentCount || 0)} inv.
                    </span>
                  </td>
                </tr>
              ))}
              {!referralTree.length ? (
                <tr>
                  <td colSpan="6" className="muted">
                    No direct/indirect referrals yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card ref-recent-card">
        <h3>Recent Referrals</h3>
        <div className="recent-list">
          {recentReferrals.length ? recentReferrals.map((entry) => (
            <article key={entry.name} className="recent-item">
              <div className="recent-left">
                <span className="recent-avatar">{entry.initials}</span>
                <div>
                  <strong>{entry.name}</strong>
                  <p className="muted small">{entry.meta}</p>
                </div>
              </div>
              <div className="recent-right">
                <strong>{entry.earning}</strong>
                <span className={entry.status === 'Active' ? 'status active' : 'status pending'}>
                  {entry.status}
                </span>
              </div>
            </article>
          )) : <p className="muted">No referrals yet.</p>}
        </div>
      </div>

      <div className="glass-card referral-how-card">
        <h3>How Referral Program Works</h3>
        <div className="how-grid">
          <article>
            <span>1</span>
            <h4>Share Your Link</h4>
            <p className="muted">Copy your unique referral link and share it with friends.</p>
          </article>
          <article>
            <span>2</span>
            <h4>They Sign Up</h4>
            <p className="muted">Your friends register using your referral link.</p>
          </article>
          <article>
            <span>3</span>
            <h4>Earn Commission</h4>
            <p className="muted">Receive commission automatically on their investments.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ReferralTreePage
