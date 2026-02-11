import { useTranslation } from "react-i18next"

import LanguageToggle from "@/components/language-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="self-end p-4">
        <LanguageToggle />
      </div>
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">{t("home.title")}</CardTitle>
          <CardDescription>{t("home.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {t("home.description")}
          </p>
          <Button>{t("home.get_started")}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
