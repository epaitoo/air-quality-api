import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

import prisma from './prisma'

// Jest mock for the 'prisma' module using 'jest-mock-extended'.
jest.mock('./prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// This allows you to use 'prismaMock' in tests to simulate Prisma behavior.
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>