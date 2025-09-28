import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, User, Bell, Code, Database, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Full-stack developer passionate about clean code and modern technologies."
  })

  const [preferences, setPreferences] = useState({
    defaultLanguage: "typescript",
    autoSave: true,
    lineNumbers: true,
    minimap: true,
    wordWrap: true,
    fontSize: 14,
    tabSize: 2
  })

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    weeklyDigest: false,
    newFeatures: true,
    securityAlerts: true
  })

  const [aiSettings, setAiSettings] = useState({
    autoTagging: true,
    smartDescriptions: true,
    codeExplanations: false,
    similarSnippets: true
  })

  const handleProfileSave = () => {
    console.log('Profile saved:', profile)
  }

  const handlePreferencesSave = () => {
    console.log('Preferences saved:', preferences)
  }

  return (
    <div className="space-y-6" data-testid="page-settings">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  Upload a new profile picture or use your initials
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-profile-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  data-testid="input-profile-email"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                data-testid="input-profile-bio"
              />
            </div>
            
            <Button onClick={handleProfileSave} data-testid="button-save-profile">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Editor Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Editor Preferences
            </CardTitle>
            <CardDescription>
              Configure code editor settings and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select 
                  value={preferences.defaultLanguage} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, defaultLanguage: value }))}
                >
                  <SelectTrigger data-testid="select-default-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select 
                  value={preferences.fontSize.toString()} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, fontSize: parseInt(value) }))}
                >
                  <SelectTrigger data-testid="select-font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { key: 'autoSave' as const, label: 'Auto Save', description: 'Automatically save changes every 30 seconds' },
                { key: 'lineNumbers' as const, label: 'Line Numbers', description: 'Show line numbers in the editor' },
                { key: 'minimap' as const, label: 'Minimap', description: 'Show code minimap for navigation' },
                { key: 'wordWrap' as const, label: 'Word Wrap', description: 'Wrap long lines of code' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={preferences[key]}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, [key]: checked }))}
                    data-testid={`switch-${key}`}
                  />
                </div>
              ))}
            </div>
            
            <Button onClick={handlePreferencesSave} data-testid="button-save-preferences">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* AI Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Features
              <Badge variant="secondary" className="ml-2">Beta</Badge>
            </CardTitle>
            <CardDescription>
              Configure AI-powered features and automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'autoTagging' as const, label: 'Auto Tagging', description: 'Automatically suggest tags based on code content' },
              { key: 'smartDescriptions' as const, label: 'Smart Descriptions', description: 'Generate descriptions for code snippets' },
              { key: 'codeExplanations' as const, label: 'Code Explanations', description: 'Add AI-generated comments explaining code' },
              { key: 'similarSnippets' as const, label: 'Similar Snippets', description: 'Find related snippets automatically' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{label}</Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={aiSettings[key]}
                  onCheckedChange={(checked) => setAiSettings(prev => ({ ...prev, [key]: checked }))}
                  data-testid={`switch-ai-${key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage email and in-app notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailUpdates' as const, label: 'Email Updates', description: 'Receive updates about your snippets and collections' },
              { key: 'weeklyDigest' as const, label: 'Weekly Digest', description: 'Get a summary of your activity each week' },
              { key: 'newFeatures' as const, label: 'New Features', description: 'Be notified when new features are released' },
              { key: 'securityAlerts' as const, label: 'Security Alerts', description: 'Important security and account notifications' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{label}</Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={notifications[key]}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                  data-testid={`switch-notification-${key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your snippets and collections
                </p>
                <Button variant="outline" size="sm" data-testid="button-export-data">
                  Export All Data
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
                <Button variant="destructive" size="sm" data-testid="button-delete-account">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}