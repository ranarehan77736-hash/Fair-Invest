export const investmentPlans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minAmount: 100,
    maxAmount: 999,
    durationDays: 30,
    dailyReturn: 2,
    totalReturn: 60,
    description: 'Perfect for beginners looking to build disciplined growth.',
    features: ['24/7 tracking', 'Fast activation', 'Basic analytics', 'Referral eligible'],
    theme: 'emerald',
  },
  {
    id: 'pro',
    name: 'Professional Plan',
    minAmount: 1000,
    maxAmount: 4999,
    durationDays: 30,
    dailyReturn: 3,
    totalReturn: 180,
    description: 'Balanced performance with premium-level earning potential.',
    features: [
      'Priority processing',
      'Enhanced analytics',
      'Higher referral multipliers',
      'Monthly bonus windows',
      'Dedicated support',
    ],
    popular: true,
    theme: 'cyan',
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    minAmount: 5000,
    maxAmount: null,
    durationDays: 90,
    dailyReturn: 4,
    totalReturn: 360,
    description: 'High-performance strategy for experienced investors.',
    features: [
      'Unlimited allocation',
      'VIP support line',
      'Advanced market insights',
      'Early access opportunities',
      'Top tier referral boosts',
      'Elite member badge',
    ],
    theme: 'violet',
  },
]

export const mockTransactions = [
  {
    id: 'TXN-1001',
    type: 'deposit',
    amount: 1200,
    status: 'completed',
    method: 'Bank Transfer',
    date: '2026-02-24',
  },
  {
    id: 'TXN-1002',
    type: 'investment',
    amount: 500,
    status: 'active',
    method: 'Starter Growth',
    date: '2026-02-25',
  },
  {
    id: 'TXN-1003',
    type: 'withdraw',
    amount: 90,
    status: 'pending',
    method: 'E-Wallet',
    date: '2026-03-01',
  },
]

export const initialReferralTree = {
  id: 'you',
  name: 'You',
  status: 'active',
  children: [
    {
      id: 'r1',
      name: 'Ayesha Khan',
      status: 'active',
      children: [
        { id: 'r1a', name: 'Bilal Ahmed', status: 'pending', children: [] },
      ],
    },
    {
      id: 'r2',
      name: 'Hamza Ali',
      status: 'active',
      children: [],
    },
  ],
}

export const initialUser = {
  name: 'John Doe',
  email: 'demo@horizoninvest.com',
  phone: '+92 300 1234567',
  referralCode: 'INVPRO10JD',
  balance: 12450,
  totalDeposits: 28000,
  totalEarnings: 12781.89,
  activeInvestments: 3,
}

export const growthData = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 18200 },
  { month: 'Mar', value: 21450 },
  { month: 'Apr', value: 26300 },
  { month: 'May', value: 33420 },
  { month: 'Jun', value: 45231 },
]

export const earningsData = [
  { month: 'Jan', earnings: 1240 },
  { month: 'Feb', earnings: 1880 },
  { month: 'Mar', earnings: 2210 },
  { month: 'Apr', earnings: 2430 },
  { month: 'May', earnings: 2650 },
  { month: 'Jun', earnings: 3010 },
]
