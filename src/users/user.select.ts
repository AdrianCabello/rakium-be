export const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  clientId: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export const userSummarySelect = {
  id: true,
  email: true,
  role: true,
  clientId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userWithPasswordSelect = {
  ...publicUserSelect,
  passwordHash: true,
} as const;
