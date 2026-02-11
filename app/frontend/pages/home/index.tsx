import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">Faktubuh</CardTitle>
          <CardDescription>Peer-to-peer Islamic debt tracking</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Track and manage debts with transparency and trust.
          </p>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </div>
  )
}
