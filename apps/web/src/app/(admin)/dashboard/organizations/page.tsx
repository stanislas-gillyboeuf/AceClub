"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/custom/data-table";
import { organizationsColumns } from "@/components/custom/organizations-columns";
import { CreateOrganizationDialog } from "@/components/custom/organization-actions";
import { useAdminOrganizations } from "@/hooks/use-admin-queries";
import type { Organization } from "@/types/admin";

const PAGE_SIZE = 20;

export default function OrganizationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  const { data, isLoading } = useAdminOrganizations({
    limit: PAGE_SIZE,
    offset: pageIndex * PAGE_SIZE,
    ...(debouncedSearch && { searchValue: debouncedSearch }),
  });

  const handleRowClick = useCallback(
    (org: Organization) => {
      router.push(`/dashboard/organizations/${org.id}`);
    },
    [router],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Organisations</h1>
        <p className="text-muted-foreground">G&eacute;rer les organisations de la plateforme</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Rechercher une organisation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle organisation
        </Button>
      </div>

      <DataTable
        columns={organizationsColumns}
        data={data?.organizations ?? []}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        pagination={{
          pageIndex,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPageIndex,
        }}
      />

      <CreateOrganizationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
