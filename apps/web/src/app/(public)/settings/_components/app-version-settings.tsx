"use client";

import { useState } from "react";

import { AlertOctagon, AlertTriangle, Apple, Save, Smartphone, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function AppVersionSettings() {
  const [activeTab, setActiveTab] = useState("ios");
  const [criticalMode, setCriticalMode] = useState(false);
  const [criticalMessage, setCriticalMessage] = useState(
    "Servers are under maintenance. We will be back shortly.",
  );

  // iOS settings
  const [iosMinVersion, setIosMinVersion] = useState("1.2.0");
  const [iosMinMessage, setIosMinMessage] = useState(
    "This version is no longer supported. Please update to continue.",
  );
  const [iosForceVersions, setIosForceVersions] = useState<string[]>(["1.5.1"]);
  const [iosForceMessage, setIosForceMessage] = useState(
    "A critical security fix is available. Update required.",
  );
  const [iosSoftVersion, setIosSoftVersion] = useState("1.6.0");
  const [iosSoftMessage, setIosSoftMessage] = useState(
    "New mini-games available! Update now to play.",
  );

  // Android settings
  const [androidMinVersion, setAndroidMinVersion] = useState("1.2.0");
  const [androidMinMessage, setAndroidMinMessage] = useState(
    "This version is no longer supported. Please update to continue.",
  );
  const [androidForceVersions, setAndroidForceVersions] = useState<string[]>(["1.4.2", "1.5.0"]);
  const [androidForceMessage, setAndroidForceMessage] = useState(
    "A critical security fix is available. Update required.",
  );
  const [androidSoftVersion, setAndroidSoftVersion] = useState("1.6.0");
  const [androidSoftMessage, setAndroidSoftMessage] = useState(
    "New features available! Update now.",
  );

  const [newVersion, setNewVersion] = useState("");

  const addForceVersion = (platform: "ios" | "android") => {
    if (!newVersion.trim()) return;
    if (platform === "ios") {
      setIosForceVersions((prev) => [...prev, newVersion.trim()]);
    } else {
      setAndroidForceVersions((prev) => [...prev, newVersion.trim()]);
    }
    setNewVersion("");
  };

  const removeForceVersion = (platform: "ios" | "android", version: string) => {
    if (platform === "ios") {
      setIosForceVersions((prev) => prev.filter((v) => v !== version));
    } else {
      setAndroidForceVersions((prev) => prev.filter((v) => v !== version));
    }
  };

  const handleSave = () => {
    toast.success("App version configuration saved successfully");
  };

  const renderPlatformContent = (platform: "ios" | "android") => {
    const minVersion = platform === "ios" ? iosMinVersion : androidMinVersion;
    const setMinVersion = platform === "ios" ? setIosMinVersion : setAndroidMinVersion;
    const minMessage = platform === "ios" ? iosMinMessage : androidMinMessage;
    const setMinMessage = platform === "ios" ? setIosMinMessage : setAndroidMinMessage;
    const forceVersions = platform === "ios" ? iosForceVersions : androidForceVersions;
    const forceMessage = platform === "ios" ? iosForceMessage : androidForceMessage;
    const setForceMessage = platform === "ios" ? setIosForceMessage : setAndroidForceMessage;
    const softVersion = platform === "ios" ? iosSoftVersion : androidSoftVersion;
    const setSoftVersion = platform === "ios" ? setIosSoftVersion : setAndroidSoftVersion;
    const softMessage = platform === "ios" ? iosSoftMessage : androidSoftMessage;
    const setSoftMessage = platform === "ios" ? setIosSoftMessage : setAndroidSoftMessage;

    return (
      <div className="space-y-6">
        {/* Minimum Version */}
        <Card className="bg-destructive/5 border-destructive/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-destructive h-4 w-4" />
              <Label className="text-foreground font-medium">1. Minimum Version (The Floor)</Label>
            </div>
            <p className="text-muted-foreground text-xs">
              Block everyone below this version. Users are forced to update.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Min Version</Label>
                <Input
                  value={minVersion}
                  onChange={(e) => setMinVersion(e.target.value)}
                  placeholder="1.2.0"
                  className="bg-background/50"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Blocking Message</Label>
                <Textarea
                  value={minMessage}
                  onChange={(e) => setMinMessage(e.target.value)}
                  rows={2}
                  className="bg-background/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Force Update Targets */}
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Upload className="text-warning h-4 w-4" />
              <Label className="text-foreground font-medium">
                2. Force Update Targets (Specific Versions)
              </Label>
            </div>
            <p className="text-muted-foreground text-xs">
              Block specific buggy versions. Users on these exact versions must update.
            </p>
            <div className="space-y-2">
              <Label className="text-xs">Target Versions</Label>
              <div className="border-border/50 bg-background/50 flex min-h-[40px] flex-wrap gap-2 rounded-lg border p-2">
                {forceVersions.map((v) => (
                  <Badge key={v} variant="secondary" className="gap-1">
                    {v}
                    <button
                      onClick={() => removeForceVersion(platform, v)}
                      className="hover:text-destructive ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addForceVersion(platform);
                    }
                  }}
                  placeholder="Type version + Enter"
                  className="h-6 w-32 border-0 bg-transparent p-0 focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Blocking Message</Label>
              <Textarea
                value={forceMessage}
                onChange={(e) => setForceMessage(e.target.value)}
                rows={2}
                className="bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Soft Update */}
        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="text-primary h-4 w-4" />
              <Label className="text-foreground font-medium">3. Soft Update (The Nudge)</Label>
            </div>
            <p className="text-muted-foreground text-xs">
              Nudge users below this version with a skippable &quot;Update Available&quot; banner.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Recommended Version</Label>
                <Input
                  value={softVersion}
                  onChange={(e) => setSoftVersion(e.target.value)}
                  placeholder="1.6.0"
                  className="bg-background/50"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Banner Message</Label>
                <Textarea
                  value={softMessage}
                  onChange={(e) => setSoftMessage(e.target.value)}
                  rows={2}
                  className="bg-background/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client App Configuration</CardTitle>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ios" className="gap-2">
                <Apple className="h-4 w-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Android
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ios" className="mt-4">
              {renderPlatformContent("ios")}
            </TabsContent>

            <TabsContent value="android" className="mt-4">
              {renderPlatformContent("android")}
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Critical Mode - Danger Zone */}
          <div
            className={`rounded-lg border-2 p-4 ${
              criticalMode
                ? "border-destructive bg-destructive/10 animate-pulse"
                : "border-destructive/30 bg-destructive/5"
            }`}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-destructive h-5 w-5" />
                <Label className="text-foreground font-medium">
                  Critical Mode (System Lockdown)
                </Label>
              </div>
              <Switch
                checked={criticalMode}
                onCheckedChange={setCriticalMode}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
            <p className="text-muted-foreground mb-3 text-xs">
              When active, ALL apps show a maintenance screen regardless of version. Use during
              database migrations or outages.
            </p>
            {criticalMode && (
              <div className="space-y-2">
                <Label className="text-xs">Maintenance Message</Label>
                <Textarea
                  value={criticalMessage}
                  onChange={(e) => setCriticalMessage(e.target.value)}
                  rows={2}
                  className="bg-background/50"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
