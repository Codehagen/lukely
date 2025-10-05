"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconDownload, IconSearch, IconTrophy, IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DoorEntry {
  id: string;
  enteredAt: Date;
  door: {
    id: string;
    doorNumber: number;
    product: {
      id: string;
      name: string;
    } | null;
  };
}

interface Winner {
  id: string;
  door: {
    id: string;
    doorNumber: number;
    product: {
      id: string;
      name: string;
    } | null;
  };
}

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  customData: any;
  createdAt: Date;
  entries: DoorEntry[];
  wins: Winner[];
}

interface Calendar {
  id: string;
  title: string;
  slug: string;
  leads: Lead[];
}

export default function LeadsManagement({ calendar }: { calendar: Calendar }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const filteredLeads = calendar.leads.filter((lead) => {
    const search = searchTerm.toLowerCase();
    return (
      lead.email.toLowerCase().includes(search) ||
      lead.name?.toLowerCase().includes(search) ||
      lead.phone?.includes(search)
    );
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/calendars/${calendar.id}/export-leads`);

      if (!response.ok) throw new Error("Failed to export leads");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${calendar.slug}-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Leads exported successfully!");
    } catch (error) {
      toast.error("Failed to export leads");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{calendar.leads.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {calendar.leads.reduce((sum, lead) => sum + lead.entries.length, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {calendar.leads.reduce((sum, lead) => sum + lead.wins.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
              </CardDescription>
            </div>
            <Button onClick={handleExportCSV} disabled={isExporting || calendar.leads.length === 0}>
              <IconDownload className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {calendar.leads.length === 0 ? "No leads captured yet" : "No leads match your search"}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>First Entry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <IconMail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{lead.email}</span>
                          </div>
                          {lead.name && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IconUser className="h-4 w-4" />
                              <span>{lead.name}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IconPhone className="h-4 w-4" />
                              <span>{lead.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit">
                            {lead.entries.length} {lead.entries.length === 1 ? "entry" : "entries"}
                          </Badge>
                          {lead.entries.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Doors: {lead.entries.map(e => e.door.doorNumber).join(", ")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.wins.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <IconTrophy className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{lead.wins.length}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(lead.createdAt), "h:mm a")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest entries across all doors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calendar.leads
              .flatMap((lead) =>
                lead.entries.map((entry) => ({
                  ...entry,
                  lead,
                }))
              )
              .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
              .slice(0, 10)
              .map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                      {entry.door.doorNumber}
                    </div>
                    <div>
                      <p className="font-medium">{entry.lead.name || entry.lead.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Entered {entry.door.product?.name || `Door ${entry.door.doorNumber}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.enteredAt), "MMM d, h:mm a")}
                  </p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
