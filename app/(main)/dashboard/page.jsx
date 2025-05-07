import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import DashboardClient from "./_components/dashboard-client";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <DashboardClient 
      accounts={accounts}
      transactions={transactions || []}
      budgetData={budgetData}
    />
  );
}
