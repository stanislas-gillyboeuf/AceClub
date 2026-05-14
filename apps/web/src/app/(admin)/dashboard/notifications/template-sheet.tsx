"use client";

import { useRef, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationTemplate } from "@/hooks/use-admin-queries";
import {
  useCreateNotificationVariant,
  useDeleteNotificationVariant,
  useSendTestNotification,
  useUpdateNotificationVariant,
  useUpsertNotificationTemplate,
} from "@/hooks/use-admin-mutations";
import type {
  NotificationType,
  NotificationTemplateVariant,
  GetNotificationTemplateResponse,
} from "@/types/admin";
import {
  NOTIFICATION_TYPE_LABELS,
  SAMPLE_VARIABLES,
} from "./notification-types";

interface Props {
  type: NotificationType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateSheet({ type, open, onOpenChange }: Props) {
  const { data, isLoading } = useNotificationTemplate(type ?? undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {type ? NOTIFICATION_TYPE_LABELS[type] : "Notification"}
          </SheetTitle>
          <SheetDescription>
            Type technique : <code className="text-xs">{type}</code>
          </SheetDescription>
        </SheetHeader>

        {isLoading || !data?.template ? (
          <div className="p-6 text-sm text-muted-foreground">Chargement…</div>
        ) : (
          <TemplateSheetContent
            // Remount on server changes so background refetches don't clobber edits.
            key={`${data.template.id}:${data.template.updatedAt}`}
            type={type!}
            template={data.template}
            variants={data.variants}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

interface ContentProps {
  type: NotificationType;
  template: GetNotificationTemplateResponse["template"];
  variants: GetNotificationTemplateResponse["variants"];
}

function TemplateSheetContent({ type, template, variants }: ContentProps) {
  const upsertTemplate = useUpsertNotificationTemplate();
  const createVariant = useCreateNotificationVariant();
  const updateVariant = useUpdateNotificationVariant();
  const deleteVariant = useDeleteNotificationVariant();
  const sendTest = useSendTestNotification();

  const [description, setDescription] = useState(template.description);
  const [variablesInput, setVariablesInput] = useState(
    template.availableVariables.join(", "),
  );
  const [templateActive, setTemplateActive] = useState(template.isActive);

  const handleSaveTemplate = () => {
    const vars = variablesInput
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    upsertTemplate.mutate({
      type,
      description,
      availableVariables: vars,
      isActive: templateActive,
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Template metadata */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description pour les admins"
            />
          </div>
          <div>
            <Label>Variables disponibles (séparées par des virgules)</Label>
            <Input
              value={variablesInput}
              onChange={(e) => setVariablesInput(e.target.value)}
              placeholder="userName, matchTime"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Utilisez <code>{`{{nomDeVariable}}`}</code> dans le titre ou le
              contenu.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={templateActive}
              onCheckedChange={setTemplateActive}
            />
            <Label>Template actif</Label>
          </div>
          <Button
            onClick={handleSaveTemplate}
            disabled={upsertTemplate.isPending}
          >
            {upsertTemplate.isPending
              ? "Enregistrement…"
              : "Enregistrer le template"}
          </Button>
        </CardContent>
      </Card>

      {/* Variants */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">
          Variantes ({variants.length})
        </h3>

        {variants.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Aucune variante. Ajoutez-en au moins une pour activer ce type de
            notification.
          </p>
        )}

        {variants.map((variant) => (
          <VariantCard
            // Remount only when the server actually changed this variant,
            // so in-progress edits aren't clobbered by background refetches.
            key={`${variant.id}:${variant.updatedAt}`}
            variant={variant}
            availableVariables={template.availableVariables}
            onUpdate={(updates) =>
              updateVariant.mutate({ id: variant.id, ...updates })
            }
            onDelete={() => deleteVariant.mutate({ id: variant.id })}
            onSendTest={() =>
              sendTest.mutate(
                {
                  variantId: variant.id,
                  variables: buildSampleVariables(template.availableVariables),
                },
                {
                  onSuccess: (res) => {
                    alert(
                      `Test envoyé !\n\n${res.title}\n${res.body}\n\nDevices notifiés : ${res.devicesNotified}/${res.devicesFound}`,
                    );
                  },
                },
              )
            }
            isDeleting={deleteVariant.isPending}
            isSendingTest={sendTest.isPending}
          />
        ))}

        <AddVariantCard
          availableVariables={template.availableVariables}
          onAdd={(payload) =>
            createVariant.mutate({ templateId: template.id, ...payload })
          }
          isPending={createVariant.isPending}
        />
      </div>
    </div>
  );
}

function buildSampleVariables(names: string[]): Record<string, string> {
  return Object.fromEntries(
    names.map((n) => [n, SAMPLE_VARIABLES[n] ?? `[${n}]`]),
  );
}

function VariableChips({
  variables,
  onInsert,
}: {
  variables: string[];
  onInsert: (token: string) => void;
}) {
  if (variables.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {variables.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onInsert(`{{${v}}}`)}
          className="rounded bg-muted px-2 py-0.5 text-xs hover:bg-muted-foreground/20"
        >
          {`{{${v}}}`}
        </button>
      ))}
    </div>
  );
}

function VariantCard({
  variant,
  availableVariables,
  onUpdate,
  onDelete,
  onSendTest,
  isDeleting,
  isSendingTest,
}: {
  variant: NotificationTemplateVariant;
  availableVariables: string[];
  onUpdate: (
    updates: Partial<{ title: string; body: string; isActive: boolean }>,
  ) => void;
  onDelete: () => void;
  onSendTest: () => void;
  isDeleting: boolean;
  isSendingTest: boolean;
}) {
  const [title, setTitle] = useState(variant.title);
  const [body, setBody] = useState(variant.body);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<"title" | "body">("body");

  const dirty = title !== variant.title || body !== variant.body;

  const insertVariable = (token: string) => {
    if (focusedField === "title") {
      setTitle((t) => t + token);
      titleRef.current?.focus();
    } else {
      setBody((b) => b + token);
      bodyRef.current?.focus();
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-2">
          <Badge variant={variant.isActive ? "default" : "secondary"}>
            {variant.isActive ? "Active" : "Désactivée"}
          </Badge>
          <div className="flex items-center gap-2">
            <Switch
              checked={variant.isActive}
              onCheckedChange={(v) => onUpdate({ isActive: v })}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Supprimer la variante"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label>Titre</Label>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocusedField("title")}
          />
        </div>
        <div>
          <Label>Contenu</Label>
          <Textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setFocusedField("body")}
            rows={3}
          />
        </div>

        <VariableChips
          variables={availableVariables}
          onInsert={insertVariable}
        />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => onUpdate({ title, body })}
            disabled={!dirty}
          >
            Enregistrer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSendTest}
            disabled={isSendingTest}
          >
            <Send className="mr-1 h-3 w-3" />
            {isSendingTest ? "Envoi…" : "Envoyer un test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddVariantCard({
  availableVariables,
  onAdd,
  isPending,
}: {
  availableVariables: string[];
  onAdd: (payload: { title: string; body: string; isActive: boolean }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<"title" | "body">("body");

  const insertVariable = (token: string) => {
    if (focusedField === "title") {
      setTitle((t) => t + token);
      titleRef.current?.focus();
    } else {
      setBody((b) => b + token);
      bodyRef.current?.focus();
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;
    onAdd({ title, body, isActive: true });
    setTitle("");
    setBody("");
  };

  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 pt-6">
        <h4 className="text-sm font-medium">Ajouter une variante</h4>
        <div>
          <Label>Titre</Label>
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setFocusedField("title")}
            placeholder="Ton match est confirmé !"
          />
        </div>
        <div>
          <Label>Contenu</Label>
          <Textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setFocusedField("body")}
            rows={3}
            placeholder="{{accepterName}} a accepté ta demande"
          />
        </div>
        <VariableChips
          variables={availableVariables}
          onInsert={insertVariable}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !title.trim() || !body.trim()}
        >
          <Plus className="mr-1 h-3 w-3" />
          {isPending ? "Ajout…" : "Ajouter"}
        </Button>
      </CardContent>
    </Card>
  );
}
