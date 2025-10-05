"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconMail, IconPhone, IconUser, IconTrophy, IconCalendar, IconCopy, IconEye, IconDownload, IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { toast } from "sonner";

export type Lead = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  calendar: {
    id: string;
    title: string;
    slug: string;
  };
  entriesCount: number;
  doorNumbers: number[];
  winsCount: number;
  winningDoors: number[];
};

export const columns: ColumnDef<Lead>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Velg alle"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Velg rad"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-post" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <IconMail className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("email")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Navn" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      return (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <span>{name || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return phone ? (
        <div className="flex items-center gap-2">
          <IconPhone className="h-4 w-4 text-muted-foreground" />
          <span>{phone}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "calendar",
    header: "Kalender",
    cell: ({ row }) => {
      const calendar = row.getValue("calendar") as Lead["calendar"];
      return (
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{calendar.title}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const calendar = row.getValue(id) as Lead["calendar"];
      return calendar.title.toLowerCase().includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "entriesCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deltakelser" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("entriesCount") as number;
      const doorNumbers = row.original.doorNumbers;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit">
            {count} {count === 1 ? "deltakelse" : "deltakelser"}
          </Badge>
          {doorNumbers.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Luker: {doorNumbers.sort((a, b) => a - b).join(", ")}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "winsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seire" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("winsCount") as number;
      const winningDoors = row.original.winningDoors;
      return count > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <IconTrophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{count}</span>
          </div>
          {winningDoors.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Luke: {winningDoors.sort((a, b) => a - b).join(", ")}
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Første deltakelse" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm">
          {format(new Date(date), "d. MMM yyyy", { locale: nb })}
          <div className="text-xs text-muted-foreground">
            {format(new Date(date), "HH:mm")}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Åpne meny</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(lead.email);
                toast.success("E-post kopiert!");
              }}
            >
              <IconCopy className="mr-2 h-4 w-4" />
              Kopier e-post
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconEye className="mr-2 h-4 w-4" />
              Vis detaljer
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconDownload className="mr-2 h-4 w-4" />
              Eksporter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
