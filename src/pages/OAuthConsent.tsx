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
  AlertTriangle,
  ExternalLink,
  Trash2,
  Save,
  Info,
  Shield,
  ShieldCheck,
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
  Bell,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { identityBlocks, blocksByCategory, BlockType, verificationBlocks, VerificationBlockType } from "@/lib/identityBlocks";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo_light from "@/assets/logo_light.png";
import logo_dark from "@/assets/logo_dark.png";

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
  const [blockLibraryCategory, setBlockLibraryCategory] = useState<string>("all");
  const [blockLibrarySearch, setBlockLibrarySearch] = useState("");
  const [appLogoLoadError, setAppLogoLoadError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setAppLogoLoadError(false);
  }, [formData.app_logo]);

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
          app_description: '',
          app_logo: '',
          application_homepage: '',
          privacy_policy_url: '',
          terms_of_service_url: '',
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

  // Preview component – matches sva_client Consent.tsx UI (Sign in with SVA style)
  const ConsentPreview = () => {
    const previewScopes: Array<{ scope: string; description: string; reason: string; icon?: string }> = [];
    selectedBlocks.forEach(({ type, reason }) => {
      if (type in identityBlocks) {
        const block = identityBlocks[type as BlockType];
        previewScopes.push({ scope: block.title, description: block.description, reason: reason, icon: block.icon });
      } else if (type in verificationBlocks) {
        const block = verificationBlocks[type as VerificationBlockType];
        previewScopes.push({ scope: block.title, description: block.description, reason: reason, icon: block.icon });
      }
    });

    // Logo URL from Setup → Branding & app info (developer-set)
    const previewData = {
      app_name: formData.app_name || selectedApp?.name || 'Your Application',
      app_description: formData.app_description || '',
      app_logo: (formData.app_logo || '').trim(),
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

    const isMobile = previewDevice === 'mobile';
    const isTablet = previewDevice === 'tablet';

    const headerPad = isMobile ? 'px-4 pt-4 pb-3' : isTablet ? 'px-6 pt-5 pb-3' : 'px-8 pt-6 pb-4';
    const panelPad = isMobile ? 'px-4 py-4' : isTablet ? 'px-6 py-5' : 'px-8 py-6';
    const logoSize = isMobile ? 'h-12 w-12' : 'h-16 w-16';
    const plusSize = isMobile ? 'h-8 w-8' : 'h-10 w-10';
    const headingSize = isMobile ? 'text-xl' : 'text-2xl';
    const aboutPad = isMobile ? 'p-3' : 'p-4';
    const footerPad = isMobile ? 'px-4 py-3' : isTablet ? 'px-6 py-3' : 'px-8 py-4';
    const footerLayout = isMobile ? 'flex-col gap-2 items-center text-center' : 'flex-row items-center justify-between';
    const footerText = isMobile ? 'text-[10px]' : 'text-xs';
    const borderCls = 'border-gray-200 dark:border-[#1E3A5F]';

    const leftPanelCls = `${panelPad} ${!isMobile ? 'border-r ' : ''}${borderCls} flex flex-col`;
    const gridCls = isMobile ? 'flex flex-col' : 'grid grid-cols-2 gap-0';

    return (
      <div className={`min-h-[400px] sm:min-h-[520px] bg-[#F5F7FA] dark:bg-[#0A1929] rounded-lg ${deviceWidths[previewDevice]} transition-all duration-300`}>
        <div className="bg-white dark:bg-[#132F4C] rounded-lg shadow-lg border border-gray-200 dark:border-[#1E3A5F] overflow-hidden">
          {/* Header: Sign in with SVA */}
          <div className={`${headerPad} border-b ${borderCls}`}>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Sign in with SVA</span>
            </div>
          </div>

          <div className={gridCls}>
            {/* Left panel */}
            <div className={leftPanelCls}>
              <div className={isMobile ? 'mb-2' : 'mb-3'}>
                {previewData.app_logo ? (
                  <div className={`flex items-center gap-2 ${isTablet ? 'gap-2.5' : ''} ${!isMobile ? 'gap-3' : ''} align-middle flex-wrap`}>
                    <img
                      src={logo_light}
                      alt="SVA Logo"
                      className={`${logoSize} object-contain block dark:hidden shrink-0`}
                    />
                    <img
                      src={logo_dark}
                      alt="SVA Logo"
                      className={`${logoSize} object-contain hidden dark:block shrink-0`}
                    />
                    <Plus className={`${plusSize} text-gray-400 rounded-lg object-contain shrink-0`} />
                    {appLogoLoadError ? (
                      <div className={`${logoSize} rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 text-lg font-semibold text-muted-foreground ${isMobile ? 'text-base' : ''}`}>
                        {(previewData.app_name || 'A').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img
                        src={previewData.app_logo}
                        alt={`${previewData.app_name} logo`}
                        className={`${logoSize} rounded-lg object-contain shrink-0`}
                        onError={() => setAppLogoLoadError(true)}
                      />
                    )}
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 ${!isMobile ? 'gap-3' : ''}`}>
                    <img
                      src={logo_light}
                      alt="SVA Logo"
                      className={`${logoSize} object-contain block dark:hidden shrink-0`}
                    />
                    <img
                      src={logo_dark}
                      alt="SVA Logo"
                      className={`${logoSize} object-contain hidden dark:block shrink-0`}
                    />
                  </div>
                )}
                <h1 className={`${headingSize} font-normal text-gray-900 dark:text-white mt-2`}>
                  Sign in to {previewData.app_name}
                </h1>
              </div>

              {/* Account placeholder */}
              <div className={isMobile ? 'py-2' : 'p-3 px-0'}>
                <div className={`border border-gray-300 dark:border-[#1E3A5F] rounded-md flex items-center justify-between min-w-0 cursor-pointer ${isMobile ? 'p-2' : 'p-2'}`}>
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`rounded-full bg-gray-200 dark:bg-[#1E3A5F] flex items-center justify-center shrink-0 ${isMobile ? 'h-9 w-9' : 'h-10 w-10'}`}>
                      <User className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">Your account</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">user@example.com</div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </div>

              {/* About Sign in with SVA */}
              <div className={isMobile ? 'mt-4 pt-4' : 'mt-auto pt-6'}>
                <div className={`${aboutPad} rounded-lg border border-[#00D09C]/20 bg-[#00D09C]/5 dark:bg-[#00D09C]/10`}>
                  <div className={`flex items-start gap-2 ${!isMobile ? 'gap-3' : ''} mb-2 ${!isMobile ? 'mb-3' : ''}`}>
                    <ShieldCheck className={`text-[#00D09C] flex-shrink-0 mt-0.5 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">About Sign in with SVA</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                        SVA uses <strong>zero-knowledge encryption</strong> to protect your data. Your information is encrypted and only you can decrypt it. We never see your plaintext data.
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2 ${!isMobile ? 'gap-3' : ''} pt-2 border-t border-[#00D09C]/20`}>
                    <AlertTriangle className={`text-amber-500 flex-shrink-0 mt-0.5 ${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      <strong className="text-amber-600 dark:text-amber-400">Important:</strong> Review the permissions below carefully. Only approve data you&apos;re comfortable sharing with <span className="font-medium">{previewData.app_name}</span>. You can revoke access anytime in your SVA settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className={`${panelPad} ${isMobile ? 'border-t ' : ''}${borderCls}`}>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                <span className="font-medium">{previewData.app_name}</span> is requesting access to:
              </p>

              {previewData.scopes.length > 0 ? (
                <div className={`space-y-2 ${!isMobile ? 'space-y-3' : ''} mb-4 sm:mb-6`}>
                  {previewData.scopes.map((scope, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 text-sm">
                      <div className="mt-0.5 text-gray-600 dark:text-gray-400 shrink-0">
                        {scope.icon ? <span className="text-base">{scope.icon}</span> : <ShieldCheck className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">{scope.scope}</span>
                          <Badge variant="outline" className="text-xs h-4 px-1.5 bg-[#00D09C]/10 text-[#00D09C] border-[#00D09C]/20 shrink-0">
                            Selected
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{scope.description}</p>
                        {scope.reason && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">Why: {scope.reason}</p>}
                      </div>
                      <Switch checked className="mt-0.5 pointer-events-none opacity-80 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">No permissions requested.</p>
              )}

              {/* Privacy Policy and Terms */}
              <div className={`text-xs text-gray-500 dark:text-gray-400 space-y-1.5 sm:space-y-2 mb-4 sm:mb-6`}>
                <p>
                  Review {previewData.app_name}&apos;s{' '}
                  {previewData.privacy_policy_url && (
                    <a href={previewData.privacy_policy_url} target="_blank" rel="noopener noreferrer" className="text-[#00D09C] hover:underline">
                      Privacy Policy
                    </a>
                  )}
                  {previewData.privacy_policy_url && previewData.terms_of_service_url && ' and '}
                  {previewData.terms_of_service_url && (
                    <a href={previewData.terms_of_service_url} target="_blank" rel="noopener noreferrer" className="text-[#00D09C] hover:underline">
                      Terms of Service
                    </a>
                  )}
                  {' '}to understand how {previewData.app_name} will process and protect your data.
                </p>
                <p>
                  To make changes at any time, go to your{' '}
                  <a href="#" className="text-[#00D09C] hover:underline">SVA Account</a>.
                </p>
                <p>
                  <a href="#" className="text-[#00D09C] hover:underline">Learn more about Sign in with SVA</a>.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-[#1E3A5F]">
                <Button variant="outline" disabled className="flex-1 border-gray-300 dark:border-[#1E3A5F] text-sm">
                  Cancel
                </Button>
                <Button disabled className="flex-1 bg-[#00D09C] hover:bg-[#00B88A] text-white text-sm">
                  Continue
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`${footerPad} border-t ${borderCls} bg-gray-50 dark:bg-[#0A1929] flex ${footerLayout} ${footerText} text-gray-500 dark:text-gray-400`}>
            <div className="flex items-center gap-1">
              <span className={isMobile ? 'text-[10px]' : ''}>English (United States)</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </div>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
              <a href="#" className="hover:underline">Help</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading consent screens…</p>
        </div>
      </div>
    );
  }

  if (oauthApps.length === 0) {
    return (
      <div className="max-w-lg mx-auto pt-8">
        <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No OAuth apps yet. Create one from the{" "}
            <a href="/credentials" className="font-medium text-primary hover:underline">Credentials</a> page, then come back to set up the consent screen.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page header: title + app selector + save */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Consent screen
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control how your app and requested permissions are shown to users when they sign in.
          </p>
        </div>
        <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:gap-4">
          <Select
            value={selectedAppId?.toString() ?? ""}
            onValueChange={(v) => v && handleSelectApp(Number(v))}
          >
            <SelectTrigger className="w-full min-w-[220px] xs:w-auto bg-background">
              <SelectValue placeholder="Select application" />
            </SelectTrigger>
            <SelectContent>
              {oauthApps.map((app) => {
                const screen = getConsentScreenForApp(app.id);
                return (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{app.name}</span>
                      {screen ? (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                          {screen.publishing_status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not configured</span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        {!selectedAppId ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Shield className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Select an application</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Choose an app from the dropdown above to configure its consent screen and permissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between" style={{ alignContent: 'center' }}>
                <TabsList className="inline-flex h-11 w-full max-w-md rounded-lg bg-muted p-1 text-muted-foreground sm:max-w-none sm:w-auto">
                  <TabsTrigger value="configuration" className="gap-2 rounded-md px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Settings className="h-4 w-4" />
                    Setup
                  </TabsTrigger>
                  <TabsTrigger value="scopes" className="gap-2 rounded-md px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Lock className="h-4 w-4" />
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="gap-2 rounded-md px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Zap className="h-4 w-4" />
                    Advanced
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2 rounded-md px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap items-center gap-3">
                  {hasChanges && (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
                      Unsaved changes
                    </Badge>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Setup Tab */}
              <TabsContent value="configuration" className="mt-6 space-y-8">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Palette className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Branding & app info</CardTitle>
                        <CardDescription>Name, description, logo, and homepage shown to users</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="app-name">App name <span className="text-destructive">*</span></Label>
                      <Input
                        id="app-name"
                        value={formData.app_name || ''}
                        onChange={(e) => handleFormChange('app_name', e.target.value)}
                        placeholder="My Application"
                        className="max-w-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-description">App description</Label>
                      <Textarea
                        id="app-description"
                        value={formData.app_description || ''}
                        onChange={(e) => handleFormChange('app_description', e.target.value)}
                        placeholder="Describe what your application does..."
                        rows={3}
                        maxLength={500}
                        className="max-w-2xl resize-none"
                      />
                      <p className="text-xs text-muted-foreground">{(formData.app_description || '').length}/500</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="app-logo">Logo URL</Label>
                        <Input
                          id="app-logo"
                          type="url"
                          value={formData.app_logo || ''}
                          onChange={(e) => handleFormChange('app_logo', e.target.value)}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="application-homepage">Homepage URL</Label>
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

                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Contact</CardTitle>
                        <CardDescription>Emails shown to users for support and developer contact</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                      <div className="space-y-2">
                        <Label htmlFor="support-email">Support email <span className="text-destructive">*</span></Label>
                        <Input
                          id="support-email"
                          type="email"
                          value={formData.support_email || ''}
                          onChange={(e) => handleFormChange('support_email', e.target.value)}
                          placeholder="support@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="developer-email">Developer email <span className="text-destructive">*</span></Label>
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

                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Legal & domains</CardTitle>
                        <CardDescription>Privacy, terms, and authorized domains</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
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
                    <div className="space-y-2 max-w-2xl">
                      <Label htmlFor="authorized-domains">Authorized domains</Label>
                      <Textarea
                        id="authorized-domains"
                        value={(formData.authorized_domains_list || []).join('\n')}
                        onChange={(e) => handleFormChange('authorized_domains_list', e.target.value.split('\n').map(d => d.trim()))}
                        placeholder="example.com&#10;app.example.com"
                        rows={3}
                        className="resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">One domain per line. Only these origins can use this app.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Publishing status</CardTitle>
                        <CardDescription>When the consent screen is visible to users</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.publishing_status || 'draft'}
                      onValueChange={(value: 'draft' | 'testing' | 'published') =>
                        handleFormChange('publishing_status', value)
                      }
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft — not visible to users</SelectItem>
                        <SelectItem value="testing">Testing — visible to test users</SelectItem>
                        <SelectItem value="published">Published — visible to all users</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preview Tab (used when sticky preview is hidden, e.g. smaller screens) */}
              <TabsContent value="preview" className="mt-6">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">How users will see it</CardTitle>
                        <CardDescription>Preview your consent screen on different screen sizes</CardDescription>
                      </div>
                      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("desktop")}
                          className={`rounded-md px-3 py-2 text-sm transition-colors ${previewDevice === "desktop" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Monitor className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("tablet")}
                          className={`rounded-md px-3 py-2 text-sm transition-colors ${previewDevice === "tablet" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Tablet className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewDevice("mobile")}
                          className={`rounded-md px-3 py-2 text-sm transition-colors ${previewDevice === "mobile" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          <Smartphone className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl min-h-[520px] flex items-start justify-center">
                      <ConsentPreview />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab – Identity Canvas style (like sva_client MyVault) */}
              <TabsContent value="scopes" className="mt-6">
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground">Data & permissions</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Add identity blocks and explain why your app needs each. Users see these on the consent screen.
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={() => setBlockPickerOpen(true)}
                        className="gap-2 font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        Add permission
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title={blockPickerOpen ? "Close block panel" : "Open block panel"}
                        onClick={() => setBlockPickerOpen(v => !v)}
                      >
                        {blockPickerOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {selectedBlocks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                      <div className="text-base font-semibold text-foreground mb-1">No blocks yet</div>
                      <div className="text-sm text-muted-foreground mb-4">Use the panel to add your first identity block.</div>
                      <Button variant="outline" onClick={() => setBlockPickerOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Blocks
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBlocks.map((selectedBlock) => {
                        const block =
                          selectedBlock.type in identityBlocks
                            ? identityBlocks[selectedBlock.type as BlockType]
                            : verificationBlocks[selectedBlock.type as VerificationBlockType];

                        return (
                          <Card
                            key={selectedBlock.id}
                            className="relative rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                          >
                            <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15 text-base">
                                {block.icon}
                              </span>
                              <div className="flex-1 min-w-0" style={{marginTop:'0px'}}>
                                <CardTitle className="text-base font-semibold leading-tight truncate">{block.title}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{block.description}</p>
                                {'verificationMethod' in block && block.verificationMethod && (
                                  <Badge variant="secondary" className="mt-1.5 text-[10px] font-normal">
                                    {block.verificationMethod === "otp" && "OTP"}
                                    {block.verificationMethod === "document" && "Document"}
                                    {block.verificationMethod === "both" && "OTP or document"}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBlock(selectedBlock.id)}
                                className="h-8 w-8 shrink-0 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-md"
                                aria-label="Remove block"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <Label className="text-xs text-muted-foreground">Reason shown to user (optional)</Label>
                              <Textarea
                                value={selectedBlock.reason}
                                onChange={(e) => handleUpdateBlockReason(selectedBlock.id, e.target.value)}
                                placeholder="Why your app needs this..."
                                rows={2}
                                className="mt-1.5 resize-none text-sm border-border/80"
                              />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Block library drawer – like sva_client BlockLibraryDrawer */}
                <Sheet open={blockPickerOpen} onOpenChange={setBlockPickerOpen}>
                  <SheetContent side="right" className="w-full sm:max-w-[320px] p-0 flex flex-col">
                    <SheetHeader className="p-4 pb-3 border-b border-border">
                      <SheetTitle className="text-left">Identity Blocks</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-3 p-3 border-b border-border">
                      <Select value={blockLibraryCategory} onValueChange={setBlockLibraryCategory}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="core">Core</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                          <SelectItem value="verification">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Search blocks..."
                        value={blockLibrarySearch}
                        onChange={(e) => setBlockLibrarySearch(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <ScrollArea className="flex-1 px-3 py-3">
                      <div className="grid grid-cols-2 gap-3 pb-4">
                        {(
                          blockLibraryCategory === "all"
                            ? [...blocksByCategory.core, ...blocksByCategory.profile, ...blocksByCategory.contact, ...blocksByCategory.verification]
                            : blocksByCategory[blockLibraryCategory as keyof typeof blocksByCategory] || []
                        )
                          .filter((type) => {
                            const def = type in identityBlocks ? identityBlocks[type as BlockType] : verificationBlocks[type as VerificationBlockType];
                            const q = blockLibrarySearch.trim().toLowerCase();
                            if (!q) return true;
                            return def.title.toLowerCase().includes(q) || def.description.toLowerCase().includes(q);
                          })
                          .map((type) => {
                            const def = type in identityBlocks ? identityBlocks[type as BlockType] : verificationBlocks[type as VerificationBlockType];
                            const isAdded = selectedBlocks.some((b) => b.type === type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => !isAdded && handleAddBlock(type)}
                                disabled={isAdded}
                                className={`relative border bg-card border-border rounded-lg p-3 flex flex-col items-center text-center shadow-sm transition-all outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring ${isAdded ? "opacity-60 grayscale pointer-events-none" : "cursor-pointer hover:scale-[1.02]"}`}
                              >
                                <span className="mb-2 w-8 h-8 flex items-center justify-center text-base rounded-lg bg-muted text-muted-foreground">
                                  {def.icon}
                                </span>
                                <span className="font-medium text-xs">{def.title}</span>
                                <span className="text-[10px] mt-1 text-muted-foreground line-clamp-2 leading-snug">{def.description}</span>
                                {isAdded && (
                                  <span className="absolute inset-0 bg-background/80 dark:bg-background/80 flex items-center justify-center text-xs font-medium rounded-lg">
                                    <Lock className="h-4 w-4 mr-1 text-muted-foreground" />
                                    Added
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="mt-6 space-y-6">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Advanced options</CardTitle>
                        <CardDescription>Optional behavior and future features</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                      <div>
                        <Label className="text-sm font-medium">Analytics tracking</Label>
                        <p className="text-xs text-muted-foreground">Track consent views and interactions</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                      <div>
                        <Label className="text-sm font-medium">Require explicit consent</Label>
                        <p className="text-xs text-muted-foreground">Users must approve each permission</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                      <div>
                        <Label className="text-sm font-medium">Expand scope details by default</Label>
                        <p className="text-xs text-muted-foreground">Show full descriptions expanded</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Custom redirect message</Label>
                      <Textarea
                        placeholder="Optional message after authorization..."
                        rows={2}
                        className="resize-none text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Export & import</CardTitle>
                    <CardDescription>Backup or share consent screen configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>


          </>
        )}
      </div>
    </div>
  );
};

export default OAuthConsent;
