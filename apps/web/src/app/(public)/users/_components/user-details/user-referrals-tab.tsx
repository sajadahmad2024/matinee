"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const referrals = [
  { name: "Alex Smith", status: "Joined", pointsEarned: 100 },
  { name: "Maria Garcia", status: "Pending", pointsEarned: 0 },
  { name: "Tom Wilson", status: "Joined", pointsEarned: 100 },
];

export function UserReferralsTab() {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="pt-4 text-center">
            <p className="text-accent font-gaming text-3xl font-bold">5</p>
            <p className="text-muted-foreground text-sm">Invites Sent</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-muted/20">
          <CardContent className="pt-4 text-center">
            <p className="text-success font-gaming text-3xl font-bold">60%</p>
            <p className="text-muted-foreground text-sm">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Referred Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {referrals.map((r, i) => (
                <TableRow key={i} className="border-border/30">
                  <TableCell className="text-foreground">{r.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "Joined"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-success text-right font-mono">
                    {r.pointsEarned > 0 ? `+${r.pointsEarned}` : "-"}
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
