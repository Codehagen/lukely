"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface NotificationPreferences {
  emailCalendarActivity: boolean;
  emailWinnerSelected: boolean;
  emailNewLeads: boolean;
  emailWeeklySummary: boolean;
}

interface SettingsNotificationsProps {
  preferences: NotificationPreferences;
}

export default function SettingsNotifications({
  preferences,
}: SettingsNotificationsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState(preferences);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Kunne ikke oppdatere varslingsinnstillinger"
        );
      }

      toast.success("Varslingsinnstillingene er oppdatert!");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message || "Kunne ikke oppdatere varslingsinnstillinger"
      );
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>E-postvarsler</CardTitle>
          <CardDescription>
            Velg hvilke varsler du ønsker å motta på e-post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="flex flex-col gap-4">
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Kalenderaktivitet</FieldLabel>
                <FieldDescription>
                  Få varsler når brukere deltar i kalenderene dine
                </FieldDescription>
              </div>
              <Switch
                checked={formData.emailCalendarActivity}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    emailCalendarActivity: checked,
                  })
                }
              />
            </Field>

            <FieldSeparator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Vinnere valgt</FieldLabel>
                <FieldDescription>
                  Varsling når en vinner blir valgt for en luke
                </FieldDescription>
              </div>
              <Switch
                checked={formData.emailWinnerSelected}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    emailWinnerSelected: checked,
                  })
                }
              />
            </Field>

            <FieldSeparator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Nye leads</FieldLabel>
                <FieldDescription>
                  Varsling når nye leads blir registrert
                </FieldDescription>
              </div>
              <Switch
                checked={formData.emailNewLeads}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, emailNewLeads: checked })
                }
              />
            </Field>

            <FieldSeparator />

            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel>Ukentlig sammendrag</FieldLabel>
                <FieldDescription>
                  Motta et ukentlig sammendrag av aktivitet og statistikk
                </FieldDescription>
              </div>
              <Switch
                checked={formData.emailWeeklySummary}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    emailWeeklySummary: checked,
                  })
                }
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Lagrer ...
            </>
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Lagre endringer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
