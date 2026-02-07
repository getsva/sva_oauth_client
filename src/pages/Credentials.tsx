import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ChevronDown, Trash2, RotateCcw, AlertTriangle, MoreVertical, Plus, Copy, Eye, EyeOff, Edit, Download, CheckCircle2, XCircle, Clock, Search, Filter, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

interface OAuthApp {
  id: number;
  name: string;
  app_type: string;
  client_id: string;
  client_secret?: string;
  masked_client_secret?: string;
  redirect_uris: string;
  redirect_uris_list?: string[];
  created_at: string;
  is_active: boolean;
  is_deleted: boolean;
}

const Credentials = () => {
  const { toast } = useToast();
  const [oauthApps, setOAuthApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOAuthApps, setSelectedOAuthApps] = useState<number[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Dialog states
  const [createOAuthDialogOpen, setCreateOAuthDialogOpen] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState<Record<number, boolean>>({});
  const [selectedOAuthAppDetails, setSelectedOAuthAppDetails] = useState<OAuthApp | null>(null);
  const [showOAuthAppDetails, setShowOAuthAppDetails] = useState(false);
  const [editingOAuthApp, setEditingOAuthApp] = useState<OAuthApp | null>(null);
  const [editOAuthDialogOpen, setEditOAuthDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Form states
  const [oauthForm, setOAuthForm] = useState({
    name: "",
    app_type: "web",
    redirect_uris: "",
  });
  const [editOAuthForm, setEditOAuthForm] = useState({
    name: "",
    app_type: "web",
    redirect_uris: "",
  });
  useEffect(() => {
    fetchCredentials();
  }, [showDeleted]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      if (showDeleted) {
        const deletedOAuthApps = await api.getDeletedOAuthApps();
        setOAuthApps(Array.isArray(deletedOAuthApps) ? deletedOAuthApps : []);
      } else {
        const oauthAppsData = await api.getOAuthApps();
        setOAuthApps(Array.isArray(oauthAppsData) ? oauthAppsData : []);
      }
    } catch (error: any) {
      setOAuthApps([]);
      toast({
        title: "Error",
        description: error.data?.message || "Failed to fetch credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOAuthApp = async () => {
    try {
      const redirectUrisList = oauthForm.redirect_uris
        .split("\n")
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);
      
      // Validate that at least one redirect URI is provided
      if (redirectUrisList.length === 0) {
        toast({
          title: "Error",
          description: "At least one redirect URI is required",
          variant: "destructive",
        });
        return;
      }
      
      const newApp = await api.createOAuthApp({
        name: oauthForm.name,
        app_type: oauthForm.app_type as "web" | "mobile" | "desktop",
        redirect_uris_list: redirectUrisList,
      });
      
      setCreateOAuthDialogOpen(false);
      setOAuthForm({ name: "", app_type: "web", redirect_uris: "" });
      
      // Show client secret in a dialog before fetching credentials
      if (newApp.client_secret) {
        // Store the new app with client secret to show in details dialog
        setSelectedOAuthAppDetails(newApp);
        setShowOAuthAppDetails(true);
        
        toast({
          title: "OAuth App Created",
          description: "Your client secret is shown in the details dialog. Save it now - it won't be shown again!",
          duration: 8000,
        });
      } else {
        toast({
          title: "Success",
          description: "OAuth app created successfully",
        });
        fetchCredentials();
      }
    } catch (error: any) {
      console.error("OAuth app creation error:", error);
      let errorMessage = "Failed to create OAuth app";
      
      if (error.data) {
        if (error.data.redirect_uris) {
          errorMessage = error.data.redirect_uris[0] || errorMessage;
        } else if (error.data.redirect_uris_list) {
          errorMessage = error.data.redirect_uris_list[0] || errorMessage;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        } else if (typeof error.data === 'string') {
          errorMessage = error.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOAuthApp = async (id: number) => {
    try {
      await api.deleteOAuthApp(id);
      toast({
        title: "Success",
        description: "OAuth app deleted successfully",
      });
      fetchCredentials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete OAuth app",
        variant: "destructive",
      });
    }
  };

  const handleEditOAuthApp = (app: OAuthApp) => {
    setEditingOAuthApp(app);
    setEditOAuthForm({
      name: app.name,
      app_type: app.app_type,
      redirect_uris: app.redirect_uris_list?.join("\n") || app.redirect_uris || "",
    });
    setEditOAuthDialogOpen(true);
  };

  const handleUpdateOAuthApp = async () => {
    if (!editingOAuthApp) return;
    
    try {
      const redirectUrisList = editOAuthForm.redirect_uris
        .split("\n")
        .map((uri) => uri.trim())
        .filter((uri) => uri.length > 0);
      
      if (redirectUrisList.length === 0) {
        toast({
          title: "Error",
          description: "At least one redirect URI is required",
          variant: "destructive",
        });
        return;
      }
      
      await api.updateOAuthApp(editingOAuthApp.id, {
        name: editOAuthForm.name,
        app_type: editOAuthForm.app_type as "web" | "mobile" | "desktop",
        redirect_uris_list: redirectUrisList,
      });
      
      toast({
        title: "Success",
        description: "OAuth app updated successfully",
      });
      
      setEditOAuthDialogOpen(false);
      setEditingOAuthApp(null);
      fetchCredentials();
    } catch (error: any) {
      console.error("OAuth app update error:", error);
      let errorMessage = "Failed to update OAuth app";
      
      if (error.data) {
        if (error.data.redirect_uris) {
          errorMessage = error.data.redirect_uris[0] || errorMessage;
        } else if (error.data.redirect_uris_list) {
          errorMessage = error.data.redirect_uris_list[0] || errorMessage;
        } else if (error.data.message) {
          errorMessage = error.data.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDownloadCredentials = (app: OAuthApp) => {
    const credentials = {
      client_id: app.client_id,
      client_secret: app.client_secret || "Not available (only shown once during creation)",
      redirect_uris: app.redirect_uris_list || [],
      authorization_endpoint: `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/authorize`,
      token_endpoint: `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/token`,
      userinfo_endpoint: `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/userinfo`,
    };
    
    const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_credentials.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Credentials saved to file",
    });
  };

  // Filter and search OAuth apps
  const filteredOAuthApps = oauthApps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || app.app_type === filterType;
    return matchesSearch && matchesFilter;
  });


  const handleRestoreOAuthApp = async (id: number) => {
    try {
      await api.restoreOAuthApp(id);
      toast({
        title: "Success",
        description: "OAuth app restored successfully",
      });
      fetchCredentials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to restore OAuth app",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedOAuthApps.length > 0) {
        await api.bulkDeleteCredentials("oauth_app", selectedOAuthApps);
        setSelectedOAuthApps([]);
      }
      toast({
        title: "Success",
        description: "Credentials deleted successfully",
      });
      fetchCredentials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete credentials",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Credentials</h1>
        <p className="text-muted-foreground mt-1">Manage OAuth 2.0 credentials for your applications</p>
      </div>


      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              OAuth 2.0 Client Configuration
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Create OAuth 2.0 client IDs to enable authentication for your applications. 
              Users can sign in with their SVA accounts using these credentials.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 <strong>Tip:</strong> Configure the consent screen for each OAuth app to customize how it appears to users during authorization.{" "}
              <Link to="/oauth-consent" className="underline hover:no-underline font-medium">
                Go to Consent Screen Management
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Dialog open={createOAuthDialogOpen} onOpenChange={setCreateOAuthDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <ChevronDown className="w-4 h-4 mr-2" />
              Create credentials
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create OAuth 2.0 Client ID</DialogTitle>
              <DialogDescription>
                Create a new OAuth 2.0 client ID for your application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="oauth-name">Name</Label>
                <Input
                  id="oauth-name"
                  value={oauthForm.name}
                  onChange={(e) => setOAuthForm({ ...oauthForm, name: e.target.value })}
                  placeholder="Enter application name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-type">Application type</Label>
                <Select
                  value={oauthForm.app_type}
                  onValueChange={(value) => setOAuthForm({ ...oauthForm, app_type: value })}
                >
                  <SelectTrigger id="oauth-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web application</SelectItem>
                    <SelectItem value="mobile" disabled>Mobile application (coming soon)</SelectItem>
                    <SelectItem value="desktop" disabled>Desktop application (coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="oauth-redirect">Authorized redirect URIs (one per line)</Label>
                <Textarea
                  id="oauth-redirect"
                  value={oauthForm.redirect_uris}
                  onChange={(e) => setOAuthForm({ ...oauthForm, redirect_uris: e.target.value })}
                  placeholder="https://example.com/callback"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOAuthDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOAuthApp} 
                disabled={!oauthForm.name || !oauthForm.redirect_uris.trim()}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={handleBulkDelete}
          disabled={selectedOAuthApps.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button variant="outline" onClick={() => setShowDeleted(!showDeleted)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {showDeleted ? "Show Active" : "Restore deleted credentials"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Create OAuth clients to enable sign-in for your applications.{" "}
        <a href="#" className="text-primary hover:underline">
          Learn more
        </a>
      </p>

      {/* OAuth Apps Section */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-medium text-foreground">OAuth 2.0 Client IDs</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-border"
                  checked={Array.isArray(oauthApps) && selectedOAuthApps.length === oauthApps.length && oauthApps.length > 0}
                  onChange={(e) => {
                    if (e.target.checked && Array.isArray(oauthApps)) {
                      setSelectedOAuthApps(oauthApps.map((app) => app.id));
                    } else {
                      setSelectedOAuthApps([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Creation date
                  <ChevronDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !Array.isArray(filteredOAuthApps) || filteredOAuthApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || filterType !== "all" 
                    ? "No OAuth clients match your filters" 
                    : "No OAuth clients to display. Create your first OAuth client to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredOAuthApps.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedOAuthApps.includes(app.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOAuthApps([...selectedOAuthApps, app.id]);
                        } else {
                          setSelectedOAuthApps(selectedOAuthApps.filter((id) => id !== app.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {app.is_active && !app.is_deleted ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                      </div>
                    ) : app.is_deleted ? (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Deleted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedOAuthAppDetails(app);
                        setShowOAuthAppDetails(true);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {app.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(app.created_at)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                      {app.app_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{app.client_id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(app.client_id)}
                        title="Copy Client ID"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {showDeleted ? (
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary h-auto p-0"
                          onClick={() => handleRestoreOAuthApp(app.id)}
                        >
                          Restore
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedOAuthAppDetails(app);
                              setShowOAuthAppDetails(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditOAuthApp(app)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadCredentials(app)}
                            title="Download Credentials"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOAuthAppDetails(app);
                                  setShowOAuthAppDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditOAuthApp(app)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadCredentials(app)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Credentials
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to="/oauth-consent" className="flex items-center">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Configure Consent Screen
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteOAuthApp(app.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      {/* OAuth App Details Dialog */}
      <Dialog open={showOAuthAppDetails} onOpenChange={(open) => {
        setShowOAuthAppDetails(open);
        // Refresh credentials when dialog closes (in case a new app was just created)
        if (!open) {
          fetchCredentials();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>OAuth 2.0 App Details</DialogTitle>
            <DialogDescription>
              Use these credentials to integrate SVA OAuth 2.0 in your application
            </DialogDescription>
          </DialogHeader>
          {selectedOAuthAppDetails && (
            <div className="space-y-6 py-4">
              {/* App Information */}
              <div className="space-y-2">
                <Label>Application Name</Label>
                <Input value={selectedOAuthAppDetails.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <div className="flex items-center gap-2">
                  <Input value={selectedOAuthAppDetails.client_id} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedOAuthAppDetails.client_id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showClientSecret[selectedOAuthAppDetails.id] ? "text" : "password"}
                    value={selectedOAuthAppDetails.client_secret || selectedOAuthAppDetails.masked_client_secret || "Not available"}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (selectedOAuthAppDetails.client_secret) {
                        copyToClipboard(selectedOAuthAppDetails.client_secret);
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {selectedOAuthAppDetails.client_secret && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientSecret({
                        ...showClientSecret,
                        [selectedOAuthAppDetails.id]: !showClientSecret[selectedOAuthAppDetails.id]
                      })}
                    >
                      {showClientSecret[selectedOAuthAppDetails.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Keep your client secret secure. It will only be shown once.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Authorized Redirect URIs</Label>
                <Textarea
                  value={selectedOAuthAppDetails.redirect_uris}
                  readOnly
                  rows={3}
                />
              </div>

              {/* Integration Instructions */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Integration Instructions</h3>
                
                <div className="space-y-2">
                  <Label>Authorization Endpoint</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/authorize`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/authorize`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Token Endpoint</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/token`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/token`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>UserInfo Endpoint</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/userinfo`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/userinfo`)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Code Example */}
                <div className="space-y-2">
                  <Label>Example: Authorization URL</Label>
                  <div className="bg-muted p-3 rounded-md">
                    <code className="text-xs break-all">
                      {`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001')}/api/auth/oauth/authorize?`}
                      {`client_id=${selectedOAuthAppDetails.client_id}&`}
                      {`redirect_uri=${encodeURIComponent(selectedOAuthAppDetails.redirect_uris.split('\n')[0] || 'https://your-app.com/callback')}&`}
                      {`response_type=code&`}
                      {`scope=openid email profile&`}
                      {`state=random_state_string`}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/auth\/?$/, '') || window.location.origin.replace(/:\d+$/, ':8001');
                      const url = `${baseUrl}/api/auth/oauth/authorize?` +
                        `client_id=${selectedOAuthAppDetails.client_id}&` +
                        `redirect_uri=${encodeURIComponent(selectedOAuthAppDetails.redirect_uris.split('\n')[0] || 'https://your-app.com/callback')}&` +
                        `response_type=code&` +
                        `scope=openid email profile&` +
                        `state=random_state_string`;
                      copyToClipboard(url);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Authorization URL
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Quick Start:</strong> Redirect users to the authorization URL above. 
                    After they authorize, they'll be redirected back to your redirect_uri with an authorization code. 
                    Exchange that code for an access token using the token endpoint.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex items-center justify-between">
            <Button 
              variant="outline"
              asChild
            >
              <Link to="/oauth-consent" onClick={() => setShowOAuthAppDetails(false)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Configure Consent Screen
              </Link>
            </Button>
            <Button onClick={() => setShowOAuthAppDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit OAuth App Dialog */}
      <Dialog open={editOAuthDialogOpen} onOpenChange={setEditOAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit OAuth 2.0 Client ID</DialogTitle>
            <DialogDescription>
              Update your OAuth 2.0 client configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-oauth-name">Name</Label>
              <Input
                id="edit-oauth-name"
                value={editOAuthForm.name}
                onChange={(e) => setEditOAuthForm({ ...editOAuthForm, name: e.target.value })}
                placeholder="Enter application name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-oauth-type">Application type</Label>
              <Select
                value={editOAuthForm.app_type}
                onValueChange={(value) => setEditOAuthForm({ ...editOAuthForm, app_type: value })}
              >
                <SelectTrigger id="edit-oauth-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Web application</SelectItem>
                  <SelectItem value="mobile" disabled>Mobile application (coming soon)</SelectItem>
                  <SelectItem value="desktop" disabled>Desktop application (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-oauth-redirect">Authorized redirect URIs (one per line)</Label>
              <Textarea
                id="edit-oauth-redirect"
                value={editOAuthForm.redirect_uris}
                onChange={(e) => setEditOAuthForm({ ...editOAuthForm, redirect_uris: e.target.value })}
                placeholder="https://example.com/callback"
                rows={4}
              />
            </div>
            {editingOAuthApp && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Client ID (cannot be changed)</p>
                <p className="font-mono text-sm">{editingOAuthApp.client_id}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOAuthDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateOAuthApp} 
              disabled={!editOAuthForm.name || !editOAuthForm.redirect_uris.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Credentials;
