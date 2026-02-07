import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Trash2,
  Save,
  Info,
  Shield,
  Settings,
  FileText,
  Mail,
  Globe,
  Lock,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Copy,
  Download,
  Upload,
  BarChart3,
  Zap,
  Palette,
  Languages,
  Bell
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { identityBlocks, blocksByCategory, BlockType, verificationBlocks, VerificationBlockType } from "@/lib/identityBlocks";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface OAuthApp {
  id: number;
  name: string;
  client_id: string;
  app_type: string;
  is_active: boolean;
}

interface ConsentScreen {
  id: number;
  oauth_app: number;
  oauth_app_name: string;
  oauth_app_client_id: string;
  app_name: string;
  app_description?: string;
  app_logo?: string;
  support_email: string;
  application_homepage?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  authorized_domains_list: string[];
  developer_contact_email: string;
  scope_descriptions?: Record<string, string>;
  scope_reasons?: Record<string, { description: string; reason: string }>;
  publishing_status: 'draft' | 'testing' | 'published';
  created_at: string;
  updated_at: string;
}

const OAuthConsent = () => {
  const [oauthApps, setOAuthApps] = useState<OAuthApp[]>([]);
  const [consentScreens, setConsentScreens] = useState<ConsentScreen[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("configuration");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [formData, setFormData] = useState<Partial<ConsentScreen>>({});
  const [scopes, setScopes] = useState<Array<{ scope: string; description: string; reason: string }>>([]);
  const [newScope, setNewScope] = useState({ scope: '', description: '', reason: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<Array<{ 
    type: BlockType | VerificationBlockType; 
    reason: string;
    id: string;
  }>>([]);
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-select first app if only one exists
    if (oauthApps.length === 1 && !selectedAppId) {
      handleSelectApp(oauthApps[0].id);
    }
  }, [oauthApps]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apps, screens] = await Promise.all([
        api.getOAuthApps(),
        api.listConsentScreens()
      ]);
      setOAuthApps(apps);
      setConsentScreens(screens);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectApp = async (appId: number) => {
    setSelectedAppId(appId);
    setActiveTab("configuration");
    setHasChanges(false);
    
    try {
      const consentScreen = await api.getConsentScreen(appId);
      setFormData(consentScreen);
      
      // Convert scope_reasons to array format
      const scopesArray: Array<{ scope: string; description: string; reason: string }> = [];
      if (consentScreen.scope_reasons) {
        Object.entries(consentScreen.scope_reasons).forEach(([scope, info]) => {
          const scopeInfo = info as { description?: string; reason?: string };
          scopesArray.push({
            scope,
            description: scopeInfo.description || '',
            reason: scopeInfo.reason || ''
          });
        });
      } else if (consentScreen.scope_descriptions) {
        Object.entries(consentScreen.scope_descriptions).forEach(([scope, description]) => {
          scopesArray.push({
            scope,
            description: (description as string) || '',
            reason: ''
          });
        });
      }
      setScopes(scopesArray);
      
      // Initialize selected blocks from scope_reasons
      const blocksArray: Array<{ type: BlockType | VerificationBlockType; reason: string; id: string }> = [];
      
      if (consentScreen.scope_reasons) {
        Object.entries(consentScreen.scope_reasons).forEach(([scope, info]) => {
          // Check if scope is a valid block type
          const isIdentityBlock = scope in identityBlocks;
          const isVerificationBlock = scope in verificationBlocks;
          
          if (isIdentityBlock || isVerificationBlock) {
            const scopeInfo = info as { description?: string; reason?: string };
            blocksArray.push({
              type: scope as BlockType | VerificationBlockType,
              reason: scopeInfo.reason || '',
              id: `${scope}-${Date.now()}-${Math.random()}`
            });
          }
        });
      }
      setSelectedBlocks(blocksArray);
    } catch (error: any) {
      if (error.message?.includes('not configured') || error.status === 404) {
        // Initialize new consent screen
        const app = oauthApps.find(a => a.id === appId);
        setFormData({
          app_name: app?.name || '',
          support_email: '',
          developer_contact_email: '',
          publishing_status: 'draft',
          authorized_domains_list: []
        });
        setScopes([]);
        setSelectedBlocks([]); // Reset selected blocks for new consent screen
      } else {
        toast.error(error.message || 'Failed to load consent screen');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!selectedAppId) {
        toast.error('Please select an OAuth app');
        return;
      }

      // Validate required fields
      if (!formData.app_name || !formData.app_name.trim()) {
        toast.error('App name is required');
        return;
      }

      if (!formData.support_email || !formData.support_email.trim()) {
        toast.error('Support email is required');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.support_email)) {
        toast.error('Please enter a valid support email address');
        return;
      }

      if (!formData.developer_contact_email || !formData.developer_contact_email.trim()) {
        toast.error('Developer contact email is required');
        return;
      }

      if (!emailRegex.test(formData.developer_contact_email)) {
        toast.error('Please enter a valid developer contact email address');
        return;
      }

      // Validate URL fields if provided
      if (formData.app_logo && formData.app_logo.trim()) {
        try {
          new URL(formData.app_logo);
        } catch {
          toast.error('Please enter a valid logo URL');
          return;
        }
      }

      if (formData.application_homepage && formData.application_homepage.trim()) {
        try {
          new URL(formData.application_homepage);
        } catch {
          toast.error('Please enter a valid application homepage URL');
          return;
        }
      }

      if (formData.privacy_policy_url && formData.privacy_policy_url.trim()) {
        try {
          new URL(formData.privacy_policy_url);
        } catch {
          toast.error('Please enter a valid privacy policy URL');
          return;
        }
      }

      if (formData.terms_of_service_url && formData.terms_of_service_url.trim()) {
        try {
          new URL(formData.terms_of_service_url);
        } catch {
          toast.error('Please enter a valid terms of service URL');
          return;
        }
      }

      // Convert selected blocks to scope_reasons format
      const scopeReasons: Record<string, { description: string; reason: string }> = {};
      
      // Add selected blocks (identity and verification)
      selectedBlocks.forEach(({ type, reason }) => {
        if (type in identityBlocks) {
          const block = identityBlocks[type as BlockType];
          scopeReasons[type] = {
            description: block.description,
            reason: reason.trim()
          };
        } else if (type in verificationBlocks) {
          const block = verificationBlocks[type as VerificationBlockType];
          scopeReasons[type] = {
            description: block.description,
            reason: reason.trim()
          };
        }
      });
      
      // Merge with custom scopes if any
      scopes.forEach(({ scope, description, reason }) => {
        if (scope && scope.trim() && !(scope in scopeReasons)) {
          scopeReasons[scope] = {
            description: description.trim() || '',
            reason: reason.trim() || ''
          };
        }
      });

      // Validate and normalize authorized domains format
      const authorizedDomains = (formData.authorized_domains_list || [])
        .filter(domain => domain.trim())
        .map(domain => {
          const trimmed = domain.trim();
          try {
            // If it's a URL, extract the hostname
            const url = new URL(trimmed);
            return url.hostname + (url.port ? `:${url.port}` : '');
          } catch {
            // If not a URL, assume it's already a domain
            return trimmed;
          }
        })
        .filter(domain => domain); // Remove empty strings

      // Validate domain format (allows localhost with ports, IPs, and standard domains)
      const invalidDomains = authorizedDomains.filter(domain => {
        // Allow localhost with optional port
        if (/^localhost(:\d+)?$/i.test(domain)) {
          return false; // Valid
        }
        // Allow IP addresses with optional port
        if (/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(domain)) {
          return false; // Valid
        }
        // Allow standard domain format (with optional port)
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?$/i;
        return !domainRegex.test(domain);
      });

      if (invalidDomains.length > 0) {
        toast.error(`Invalid domain format: ${invalidDomains.join(', ')}`);
        return;
      }

      const data = {
        app_name: formData.app_name.trim(),
        app_description: formData.app_description?.trim() || '',
        app_logo: formData.app_logo?.trim() || '',
        support_email: formData.support_email.trim(),
        application_homepage: formData.application_homepage?.trim() || '',
        privacy_policy_url: formData.privacy_policy_url?.trim() || '',
        terms_of_service_url: formData.terms_of_service_url?.trim() || '',
        authorized_domains_list: authorizedDomains,
        developer_contact_email: formData.developer_contact_email.trim(),
        scope_reasons: scopeReasons,
        publishing_status: formData.publishing_status || 'draft'
      };

      if (formData.id) {
        await api.updateConsentScreen(selectedAppId, data);
        toast.success('Consent screen updated successfully');
      } else {
        await api.createOrUpdateConsentScreen(selectedAppId, data);
        toast.success('Consent screen created successfully');
      }

      setHasChanges(false);
      // Reload the consent screen to get updated data
      await loadData();
      // Re-select the app to refresh the form with saved data
      if (selectedAppId) {
        await handleSelectApp(selectedAppId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save consent screen');
    }
  };


  const handleAddBlock = (blockType: BlockType | VerificationBlockType) => {
    // Check if block is already added
    if (selectedBlocks.some(b => b.type === blockType)) {
      toast.error('This block is already added');
      return;
    }
    
    setSelectedBlocks([...selectedBlocks, {
      type: blockType,
      reason: '',
      id: `${blockType}-${Date.now()}-${Math.random()}`
    }]);
    setBlockPickerOpen(false);
    setHasChanges(true);
  };

  const handleRemoveBlock = (id: string) => {
    setSelectedBlocks(selectedBlocks.filter(b => b.id !== id));
    setHasChanges(true);
  };

  const handleUpdateBlockReason = (id: string, reason: string) => {
    setSelectedBlocks(selectedBlocks.map(b => 
      b.id === id ? { ...b, reason } : b
    ));
    setHasChanges(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const getConsentScreenForApp = (appId: number) => {
    return consentScreens.find(cs => cs.oauth_app === appId);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string, color: string }> = {
      draft: { variant: "secondary", label: "Draft", color: "bg-gray-100 text-gray-800" },
      testing: { variant: "default", label: "Testing", color: "bg-blue-100 text-blue-800" },
      published: { variant: "default", label: "Published", color: "bg-green-100 text-green-800" }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const selectedApp = oauthApps.find(a => a.id === selectedAppId);
  const consentScreen = getConsentScreenForApp(selectedAppId || 0);

  // Preview component
  const ConsentPreview = () => {
    // Build preview scopes from selected blocks and custom scopes
    const previewScopes: Array<{ scope: string; description: string; reason: string; icon?: string }> = [];
    
    // Add selected blocks (identity and verification)
    selectedBlocks.forEach(({ type, reason }) => {
      if (type in identityBlocks) {
        const block = identityBlocks[type as BlockType];
        previewScopes.push({
          scope: block.title,
          description: block.description,
          reason: reason,
          icon: block.icon
        });
      } else if (type in verificationBlocks) {
        const block = verificationBlocks[type as VerificationBlockType];
        previewScopes.push({
          scope: block.title,
          description: block.description,
          reason: reason,
          icon: block.icon
        });
      }
    });
    
    // Don't show default scopes if nothing is selected
    // Only show blocks that the developer has actually selected
    
    const previewData = {
      app_name: formData.app_name || selectedApp?.name || 'Your Application',
      app_description: formData.app_description || '',
      app_logo: formData.app_logo || '',
      application_homepage: formData.application_homepage || '',
      privacy_policy_url: formData.privacy_policy_url || '',
      terms_of_service_url: formData.terms_of_service_url || '',
      support_email: formData.support_email || '',
      scopes: previewScopes
    };

    const deviceWidths = {
      desktop: 'w-full',
      tablet: 'max-w-2xl mx-auto',
      mobile: 'max-w-sm mx-auto'
    };

  return (
      <div className={`${deviceWidths[previewDevice]} transition-all duration-300`}>
        <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-8 mb-6 shadow-card">
          <div className="bg-card rounded-xl p-6 border border-border">
            {/* Logo and App Name */}
            <div className="text-center mb-6">
              {previewData.app_logo && (
                <img 
                  src={previewData.app_logo} 
                  alt={previewData.app_name}
                  className="w-16 h-16 mx-auto mb-4 rounded-xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                {previewData.app_name}
              </h1>
              {previewData.app_description && (
                <p className="text-sm text-muted-foreground">{previewData.app_description}</p>
              )}
      </div>

            {/* App Info */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border">
              <div className="font-medium text-foreground mb-1">{previewData.app_name}</div>
              <div className="text-sm text-muted-foreground">wants to access your account</div>
              {previewData.application_homepage && (
                <a 
                  href={previewData.application_homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Visit application →
                </a>
              )}
            </div>

            {/* Scopes/Blocks */}
            {previewData.scopes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground mb-4">
                This application will be able to:
              </h3>
              <div className="space-y-3">
                {previewData.scopes.map((scope, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                      {scope.icon ? (
                        <span className="text-lg">{scope.icon}</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-foreground mb-1">{scope.scope}</div>
                      <div className="text-xs text-muted-foreground">{scope.description}</div>
                      {scope.reason && (
                        <div className="text-xs text-muted-foreground italic mt-1">
                          Reason: {scope.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-4">
              <button className="flex-1 px-4 py-2 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors border border-border">
                Deny
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-glow">
                Authorize
              </button>
          </div>

            {/* Footer Links */}
            {(previewData.privacy_policy_url || previewData.terms_of_service_url || previewData.support_email) && (
              <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-4 justify-center mb-2">
                  {previewData.privacy_policy_url && (
                    <a href={previewData.privacy_policy_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  )}
                  {previewData.terms_of_service_url && (
                    <a href={previewData.terms_of_service_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                  )}
                </div>
                {previewData.support_email && (
                  <div className="text-center">
                    Support: <a href={`mailto:${previewData.support_email}`} className="text-primary hover:underline">
                      {previewData.support_email}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center mt-4">
              Redirecting to: {selectedApp?.client_id || 'your-app.com'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (oauthApps.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No OAuth apps found. Please create an OAuth app first from the{" "}
            <a href="/credentials" className="text-primary hover:underline font-medium">Credentials</a> page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">OAuth Consent Screen</h1>
            <p className="text-muted-foreground">
              Configure and preview how your OAuth application appears to users
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <RefreshCw className="w-3 h-3 mr-1" />
                Unsaved changes
              </Badge>
            )}
            <Button onClick={handleSave} disabled={!selectedAppId || !hasChanges} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
          </div>
        </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - App Selection */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">OAuth Applications</CardTitle>
              <CardDescription>Select an app to configure</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {oauthApps.map((app) => {
                  const screen = getConsentScreenForApp(app.id);
                  const isSelected = selectedAppId === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleSelectApp(app.id)}
                      className={`w-full text-left p-4 border-l-4 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm">{app.name}</div>
                        {screen ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{app.client_id}</div>
                      {screen && (
                        <div className="mt-2">
                          {getStatusBadge(screen.publishing_status)}
            </div>
                      )}
                    </button>
                  );
                })}
          </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="col-span-9">
          {!selectedAppId ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select an OAuth Application</h3>
                <p className="text-muted-foreground">
                  Choose an application from the sidebar to configure its consent screen
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="configuration" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configuration
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="scopes" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Scopes & Permissions
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Configuration Tab */}
              <TabsContent value="configuration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>App Information</CardTitle>
                    <CardDescription>Basic information about your application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-name">App name *</Label>
                      <Input
                        id="app-name"
                        value={formData.app_name || ''}
                        onChange={(e) => handleFormChange('app_name', e.target.value)}
                        placeholder="My Application"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="app-description">App description</Label>
                      <Textarea
                        id="app-description"
                        value={formData.app_description || ''}
                        onChange={(e) => handleFormChange('app_description', e.target.value)}
                        placeholder="Describe what your application does..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {(formData.app_description || '').length}/500 characters
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="app-logo">App logo URL</Label>
                        <Input
                          id="app-logo"
                          type="url"
                          value={formData.app_logo || ''}
                          onChange={(e) => handleFormChange('app_logo', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="application-homepage">Application homepage</Label>
                        <Input
                          id="application-homepage"
                          type="url"
                          value={formData.application_homepage || ''}
                          onChange={(e) => handleFormChange('application_homepage', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>How users can reach you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="support-email">User support email *</Label>
                        <Input
                          id="support-email"
                          type="email"
                          value={formData.support_email || ''}
                          onChange={(e) => handleFormChange('support_email', e.target.value)}
                          placeholder="support@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="developer-email">Developer contact email *</Label>
                        <Input
                          id="developer-email"
                          type="email"
                          value={formData.developer_contact_email || ''}
                          onChange={(e) => handleFormChange('developer_contact_email', e.target.value)}
                          placeholder="developer@example.com"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Terms</CardTitle>
                    <CardDescription>Legal information for users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="privacy-policy">Privacy policy URL</Label>
                        <Input
                          id="privacy-policy"
                          type="url"
                          value={formData.privacy_policy_url || ''}
                          onChange={(e) => handleFormChange('privacy_policy_url', e.target.value)}
                          placeholder="https://example.com/privacy"
                        />
            </div>

                      <div className="space-y-2">
                        <Label htmlFor="terms-of-service">Terms of service URL</Label>
                        <Input
                          id="terms-of-service"
                          type="url"
                          value={formData.terms_of_service_url || ''}
                          onChange={(e) => handleFormChange('terms_of_service_url', e.target.value)}
                          placeholder="https://example.com/terms"
                        />
          </div>
        </div>

                    <div className="space-y-2">
                      <Label htmlFor="authorized-domains">Authorized domains</Label>
                      <Textarea
                        id="authorized-domains"
                        value={(formData.authorized_domains_list || []).join('\n')}
                        onChange={(e) => handleFormChange('authorized_domains_list', e.target.value.split('\n').filter(d => d.trim()))}
                        placeholder="example.com&#10;subdomain.example.com"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        One domain per line. Users from these domains can access your app.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Publishing</CardTitle>
                    <CardDescription>Control when your consent screen is visible</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="publishing-status">Publishing status</Label>
                      <Select
                        value={formData.publishing_status || 'draft'}
                        onValueChange={(value: 'draft' | 'testing' | 'published') =>
                          handleFormChange('publishing_status', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft - Not visible to users</SelectItem>
                          <SelectItem value="testing">Testing - Visible to test users</SelectItem>
                          <SelectItem value="published">Published - Visible to all users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>See exactly how your consent screen will appear to users</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={previewDevice === "desktop" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewDevice("desktop")}
                        >
                          <Monitor className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={previewDevice === "tablet" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewDevice("tablet")}
                        >
                          <Tablet className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={previewDevice === "mobile" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewDevice("mobile")}
                        >
                          <Smartphone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/20 rounded-2xl p-8 min-h-[600px] border border-border">
                      <ConsentPreview />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scopes Tab */}
              <TabsContent value="scopes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Identity Blocks & Permissions</CardTitle>
                        <CardDescription>
                          Select blocks from the panel and add reasons for why your app needs access to each
                        </CardDescription>
                      </div>
                      <Button onClick={() => setBlockPickerOpen(true)} variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Block
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Selected Blocks */}
                    {selectedBlocks.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No blocks selected</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Click "Add Block" to select identity blocks your application needs access to
                        </p>
                        <Button onClick={() => setBlockPickerOpen(true)} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Block
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Selected Blocks</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {selectedBlocks.length} block{selectedBlocks.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
                        <div className="space-y-3">
                          {selectedBlocks.map((selectedBlock) => {
                            const block = 
                              selectedBlock.type in identityBlocks 
                                ? identityBlocks[selectedBlock.type as BlockType]
                                : verificationBlocks[selectedBlock.type as VerificationBlockType];
                            
                            return (
                              <Card key={selectedBlock.id} className="border-primary">
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{block.icon}</span>
                                        <div>
                                          <Label className="text-base font-medium">{block.title}</Label>
                                          <p className="text-sm text-muted-foreground">{block.description}</p>
                                          {'verificationMethod' in block && block.verificationMethod && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                              {block.verificationMethod === "otp" && "OTP Verified"}
                                              {block.verificationMethod === "document" && "Document Verified"}
                                              {block.verificationMethod === "both" && "OTP or Document Verified"}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-sm font-medium">Reason for requesting this block</Label>
                                        <Textarea
                                          value={selectedBlock.reason}
                                          onChange={(e) => handleUpdateBlockReason(selectedBlock.id, e.target.value)}
                                          placeholder="Explain why your app needs access to this block..."
                                          rows={3}
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveBlock(selectedBlock.id)}
                                      className="flex-shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Block Picker Dialog */}
                <CommandDialog open={blockPickerOpen} onOpenChange={setBlockPickerOpen}>
                  <CommandInput placeholder="Search blocks..." />
                  <CommandList>
                    <CommandEmpty>No blocks found.</CommandEmpty>
                    
                    {/* Core Identity Blocks */}
                    <CommandGroup heading="Core Identity">
                      {blocksByCategory.core.map((blockType) => {
                        const block = identityBlocks[blockType as BlockType];
                        const isAdded = selectedBlocks.some(b => b.type === blockType);
                        return (
                          <CommandItem
                            key={blockType}
                            value={block.title}
                            onSelect={() => !isAdded && handleAddBlock(blockType)}
                            disabled={isAdded}
                            className={isAdded ? "opacity-50" : ""}
                          >
                            <span className="mr-2 text-xl">{block.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{block.title}</div>
                              <div className="text-xs text-muted-foreground">{block.description}</div>
                            </div>
                            {isAdded && <Badge variant="secondary" className="ml-2">Added</Badge>}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>

                    {/* Profile Blocks */}
                    <CommandGroup heading="Profile Information">
                      {blocksByCategory.profile.map((blockType) => {
                        const block = identityBlocks[blockType as BlockType];
                        const isAdded = selectedBlocks.some(b => b.type === blockType);
                        return (
                          <CommandItem
                            key={blockType}
                            value={block.title}
                            onSelect={() => !isAdded && handleAddBlock(blockType)}
                            disabled={isAdded}
                            className={isAdded ? "opacity-50" : ""}
                          >
                            <span className="mr-2 text-xl">{block.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{block.title}</div>
                              <div className="text-xs text-muted-foreground">{block.description}</div>
                            </div>
                            {isAdded && <Badge variant="secondary" className="ml-2">Added</Badge>}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>

                    {/* Contact Blocks */}
                    <CommandGroup heading="Contact Information">
                      {blocksByCategory.contact.map((blockType) => {
                        const block = identityBlocks[blockType as BlockType];
                        const isAdded = selectedBlocks.some(b => b.type === blockType);
                        return (
                          <CommandItem
                            key={blockType}
                            value={block.title}
                            onSelect={() => !isAdded && handleAddBlock(blockType)}
                            disabled={isAdded}
                            className={isAdded ? "opacity-50" : ""}
                          >
                            <span className="mr-2 text-xl">{block.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{block.title}</div>
                              <div className="text-xs text-muted-foreground">{block.description}</div>
                            </div>
                            {isAdded && <Badge variant="secondary" className="ml-2">Added</Badge>}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>

                    {/* Verification Blocks */}
                    <CommandGroup heading="Verified Identity Information">
                      {blocksByCategory.verification.map((blockType) => {
                        const block = verificationBlocks[blockType as VerificationBlockType];
                        const isAdded = selectedBlocks.some(b => b.type === blockType);
                        return (
                          <CommandItem
                            key={blockType}
                            value={block.title}
                            onSelect={() => !isAdded && handleAddBlock(blockType)}
                            disabled={isAdded}
                            className={isAdded ? "opacity-50" : ""}
                          >
                            <span className="mr-2 text-xl">{block.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{block.title}</div>
                              <div className="text-xs text-muted-foreground">{block.description}</div>
                              {block.verificationMethod && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {block.verificationMethod === "otp" && "OTP Verified"}
                                  {block.verificationMethod === "document" && "Document Verified"}
                                  {block.verificationMethod === "both" && "OTP or Document Verified"}
                                </Badge>
                              )}
                            </div>
                            {isAdded && <Badge variant="secondary" className="ml-2">Added</Badge>}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </CommandDialog>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Additional configuration options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable analytics tracking</Label>
                        <p className="text-sm text-muted-foreground">
                          Track consent screen views and user interactions
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Require explicit consent</Label>
                        <p className="text-sm text-muted-foreground">
                          Users must explicitly approve each scope
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show scope details by default</Label>
                        <p className="text-sm text-muted-foreground">
                          Expand scope descriptions by default
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Custom redirect message</Label>
                      <Textarea
                        placeholder="Optional message shown after successful authorization..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export & Import</CardTitle>
                    <CardDescription>Backup or share your consent screen configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export Configuration
          </Button>
                      <Button variant="outline" className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Configuration
          </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
