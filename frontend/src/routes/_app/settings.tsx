import { createFileRoute } from "@tanstack/react-router"
import { Moon, Shield, Sun, User } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/common/theme-provider"
import { toast } from "sonner"

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageHeader title="Settings" description="Manage your profile, appearance, and notification preferences." />

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-accent-soft text-lg text-accent">GO</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Government Officer</p>
              <p className="text-xs text-muted-foreground">District Administration · Public Works Department</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Government Officer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="officer@dept.gov.in" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" defaultValue="Public Works Department" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input id="district" defaultValue="Krishna" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.success("Profile updated")}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark interface themes.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Critical risk alerts", description: "Immediate notification for critical-risk findings.", defaultChecked: true },
            { label: "Weekly digest", description: "Summary of new insights and reports every Monday.", defaultChecked: true },
            { label: "Payment anomalies", description: "Alerts when disbursement precedes verified progress.", defaultChecked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
