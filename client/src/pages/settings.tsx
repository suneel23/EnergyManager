import { AppLayout } from "@/layouts/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BadgeCheck, Save, Database, Bell, Shield, Palette, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
          <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-flex mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary-600" />
                    Regional Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="CST">CST (Central Standard Time)</option>
                        <option value="MST">MST (Mountain Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <select
                        id="date-format"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Database className="mr-2 h-5 w-5 text-primary-600" />
                    Data Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="refresh-interval">Data Refresh Interval (seconds)</Label>
                      <Input
                        id="refresh-interval"
                        type="number"
                        min="5"
                        max="3600"
                        defaultValue="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                      <Input
                        id="data-retention"
                        type="number"
                        min="30"
                        max="3650"
                        defaultValue="365"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="auto-refresh" defaultChecked />
                    <Label htmlFor="auto-refresh">Enable automatic data refresh</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <RefreshCw className="mr-2 h-5 w-5 text-primary-600" />
                    Zonus Meter Integration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zonus-api-url">Zonus API URL</Label>
                      <Input
                        id="zonus-api-url"
                        placeholder="https://api.zonus.com/v1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zonus-polling">Polling Interval (minutes)</Label>
                      <Input
                        id="zonus-polling"
                        type="number"
                        min="1"
                        max="60"
                        defaultValue="5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="zonus-enabled" defaultChecked />
                    <Label htmlFor="zonus-enabled">Enable Zonus integration</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-primary-600" />
                    Alert Notifications
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Critical Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for critical system alerts
                        </p>
                      </div>
                      <Switch id="critical-alerts" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Warning Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for warning-level alerts
                        </p>
                      </div>
                      <Switch id="warning-alerts" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Information Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications for informational alerts
                        </p>
                      </div>
                      <Switch id="info-alerts" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <BadgeCheck className="mr-2 h-5 w-5 text-primary-600" />
                    Work Permit Notifications
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permit Approvals</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for work permit approvals
                        </p>
                      </div>
                      <Switch id="permit-approvals" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permit Requests</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for new work permit requests
                        </p>
                      </div>
                      <Switch id="permit-requests" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permit Expiration</Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for permits nearing expiration
                        </p>
                      </div>
                      <Switch id="permit-expiration" defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Delivery</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications within the application
                        </p>
                      </div>
                      <Switch id="in-app" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send notifications to your email address
                        </p>
                      </div>
                      <Switch id="email" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Send critical notifications via SMS
                        </p>
                      </div>
                      <Switch id="sms" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary-600" />
                    Password Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <Button variant="outline">Change Password</Button>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Password Expiry</Label>
                          <p className="text-sm text-muted-foreground">
                            Require password change every 90 days
                          </p>
                        </div>
                        <Switch id="password-expiry" defaultChecked />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Strong Password Requirements</Label>
                          <p className="text-sm text-muted-foreground">
                            Enforce complex password rules
                          </p>
                        </div>
                        <Switch id="strong-password" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Login Security</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable 2FA for additional security
                        </p>
                      </div>
                      <Switch id="two-factor" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically log out after inactivity
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                        <Switch id="session-timeout" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Activity Log</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      View and manage your recent account activity
                    </p>
                    <Button variant="outline">View Activity Log</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-primary-600" />
                    Theme
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 cursor-pointer bg-white">
                      <div className="h-20 bg-white border rounded mb-2 flex items-center justify-center text-black">
                        Light Theme
                      </div>
                      <div className="flex items-center">
                        <Switch id="light-theme" defaultChecked />
                        <Label htmlFor="light-theme" className="ml-2">Light Mode</Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 cursor-pointer">
                      <div className="h-20 bg-neutral-900 border rounded mb-2 flex items-center justify-center text-white">
                        Dark Theme
                      </div>
                      <div className="flex items-center">
                        <Switch id="dark-theme" />
                        <Label htmlFor="dark-theme" className="ml-2">Dark Mode</Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 cursor-pointer">
                      <div className="h-20 bg-gradient-to-b from-white to-neutral-900 border rounded mb-2 flex items-center justify-center text-neutral-800">
                        System Default
                      </div>
                      <div className="flex items-center">
                        <Switch id="system-theme" />
                        <Label htmlFor="system-theme" className="ml-2">System Default</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Display Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Display more content with reduced spacing
                        </p>
                      </div>
                      <Switch id="compact-mode" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Grid Lines</Label>
                        <p className="text-sm text-muted-foreground">
                          Display grid lines in tables and charts
                        </p>
                      </div>
                      <Switch id="grid-lines" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable interface animations
                        </p>
                      </div>
                      <Switch id="animations" defaultChecked />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dashboard Layout</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Customize which widgets appear on your dashboard
                    </p>
                    <Button variant="outline">Configure Dashboard</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
