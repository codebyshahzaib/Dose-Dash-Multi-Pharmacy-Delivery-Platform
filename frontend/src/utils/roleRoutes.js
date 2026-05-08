export const ROLE_HOME = {
  ADMIN:          '/admin',
  CUSTOMER:       '/customer',
  PHARMACIST:     '/pharmacist',
  PHARMACY_OWNER: '/pharmacy-owner',
  RIDER:          '/rider',
};

export const PUBLIC_ROLES = ['CUSTOMER', 'PHARMACY_OWNER'];

export const ROLE_META = {
  CUSTOMER: {
    label: 'Customer',
    description: 'Upload prescriptions & track orders',
    icon: '🛒',
    color: 'from-sky-500 to-cyan-400',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    ring: 'ring-sky-400',
  },
  PHARMACIST: {
    label: 'Pharmacist',
    description: 'Review prescriptions & send proposals',
    icon: '💊',
    color: 'from-violet-500 to-purple-400',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    ring: 'ring-violet-400',
  },
  PHARMACY_OWNER: {
    label: 'Pharmacy Owner',
    description: 'Manage your pharmacy & fulfil orders',
    icon: '🏥',
    color: 'from-emerald-500 to-teal-400',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    ring: 'ring-emerald-400',
  },
  RIDER: {
    label: 'Rider',
    description: 'Pick up & deliver orders near you',
    icon: '🏍️',
    color: 'from-orange-500 to-amber-400',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    ring: 'ring-orange-400',
  },
};