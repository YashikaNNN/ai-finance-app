"use client";

import { AccountCard } from "./account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./transaction-overview";
import { GenerateReportButton } from "./generate-report-button";

export default function DashboardClient({ accounts, transactions, budgetData }) {
  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* Dashboard Overview */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions}
      />

      {/* Generate Report Button */}
      <div className="max-w-xs mx-auto">
        <GenerateReportButton />
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>
    </div>
  );
} 