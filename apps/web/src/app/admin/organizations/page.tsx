"use client";

import { useCallback, useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { Search, RefreshCw, Building2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface SearchOrganizationsResponse {
  organizations: Organization[];
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<SearchOrganizationsResponse>(
        "/organization/search",
        {
          params: {
            query: searchQuery || undefined,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
          },
        }
      );
      setOrganizations(data.organizations ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setOrganizations([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleDeleteOrganization = async (organizationId: string) => {
    if (!confirm("Supprimer cette organisation ?")) return;
    try {
      await apiFetch("/organization/delete", {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      });
      fetchOrganizations();
    } catch (err) {
      console.error("Failed to delete organization:", err);
    }
  };

  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "name",
      header: "Organisation",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.logo ? (
            <img
              src={row.original.logo}
              alt={row.original.name}
              className="h-9 w-9 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          )}
          <div>
            <div className="font-medium">{row.original.name}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.slug}
        </Badge>
      ),
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.id.slice(0, 16)}...
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDeleteOrganization(row.original.id)}
          >
            Supprimer
          </Button>
        );
      },
    },
  ];

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organisations</h1>
        <p className="text-muted-foreground">
          Gestion des organisations (clubs) de la plateforme.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une organisation..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrganizations}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={organizations}
        pageCount={pageCount}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
