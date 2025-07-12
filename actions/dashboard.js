"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

// Cached user lookup to avoid repeated database calls
const getCachedUser = unstable_cache(
  async (userId) => {
    // Only fetch from DB, do not use dynamic Clerk helpers here
    return await db.user.findUnique({ where: { clerkUserId: userId } });
  },
  ['user-lookup'],
  { revalidate: 300 } // Cache for 5 minutes
);

// Optimized dashboard data fetching with caching
export const getDashboardDataOptimized = unstable_cache(
  async (userId) => {
    const user = await getCachedUser(userId);
    if (!user) throw new Error("User not found");

    // Parallel database calls for better performance
    const [accounts, transactions, budget] = await Promise.all([
      db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 50, // Limit to recent transactions for faster loading
      }),
      db.budget.findFirst({
        where: { userId: user.id },
      }),
    ]);

    const defaultAccount = accounts.find((account) => account.isDefault);
    
    // Get current month expenses only if there's a default account
    let currentExpenses = 0;
    if (defaultAccount && budget) {
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const expenses = await db.transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          accountId: defaultAccount.id,
        },
        _sum: {
          amount: true,
        },
      });

      currentExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;
    }

    return {
      accounts: accounts.map(serializeTransaction),
      transactions: transactions.map(serializeTransaction),
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses,
    };
  },
  ['dashboard-data'],
  { revalidate: 60 } // Cache for 1 minute
);

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const dashboardData = await getDashboardDataOptimized(userId);
    return dashboardData.accounts;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await getCachedUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const dashboardData = await getDashboardDataOptimized(userId);
    return dashboardData.transactions;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

// New optimized function for getting budget data
export async function getBudgetDataOptimized() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const dashboardData = await getDashboardDataOptimized(userId);
    return {
      budget: dashboardData.budget,
      currentExpenses: dashboardData.currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    return { budget: null, currentExpenses: 0 };
  }
}
