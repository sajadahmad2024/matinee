"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transactions = [
  { type: "Game Reward", description: "Weekly Contest Win", amount: 150, date: "Today" },
  { type: "Subscription", description: "Premium Monthly", amount: -9.99, date: "Jan 1" },
  { type: "Referral Bonus", description: "User joined", amount: 100, date: "Dec 28" },
];

export function UserWalletTab() {
  return (
    <div className="mt-4 space-y-4">
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Transaction Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, i) => (
                <TableRow key={i} className="border-border/30">
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  <TableCell
                    className={`text-right font-mono ${
                      t.amount > 0 ? "text-success" : "text-destructive"
                    }`}>
                    {t.amount > 0 ? `+${t.amount}` : t.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
