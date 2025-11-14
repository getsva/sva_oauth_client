import { APICard } from "@/components/Library/APICard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ChevronDown, MapPin, Code, FileCode } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Library = () => {
  const categories = [
    { name: "Analytics", count: 11 },
    { name: "Big data", count: 22 },
    { name: "Databases", count: 6 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/30 to-background py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-normal text-foreground">API Library</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Welcome to the API Library<br />
            The API Library has documentation, links, and a smart search experience.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for APIs & Services"
              className="pl-12 h-12 bg-card border-border text-base"
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            <aside className="w-64 shrink-0">
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4" />
                  <Input placeholder="Type to filter" className="flex-1 h-8 text-sm" />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <button className="flex items-center justify-between w-full mb-3">
                  <span className="font-medium text-sm text-foreground">Visibility</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground hover:text-foreground cursor-pointer">
                    <span>Public</span>
                    <span>(498)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground hover:text-foreground cursor-pointer">
                    <span>Private</span>
                    <span>(2)</span>
                  </div>
                </div>

                <button className="flex items-center justify-between w-full mt-6 mb-3">
                  <span className="font-medium text-sm text-foreground">Category</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="space-y-2 text-sm">
                  {categories.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex justify-between text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <span>({cat.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <main className="flex-1">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-normal text-foreground">Maps</h2>
                  <Button variant="link" className="text-primary">
                    View all (32)
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <APICard
                    name="Maps SDK for Android"
                    provider="Google"
                    description="Maps for your native Android app."
                    icon={<FileCode className="w-6 h-6 text-green-500" />}
                  />
                  <APICard
                    name="Maps SDK for iOS"
                    provider="Google"
                    description="Maps for your native iOS app."
                    icon={<Code className="w-6 h-6 text-blue-500" />}
                  />
                  <APICard
                    name="Maps JavaScript API"
                    provider="Google"
                    description="Maps for your website"
                    icon={<FileCode className="w-6 h-6 text-yellow-500" />}
                  />
                  <APICard
                    name="Places API"
                    provider="Google Enterprise API"
                    description="Get detailed information about 100 million places"
                    icon={<MapPin className="w-6 h-6 text-red-500" />}
                    isEnterprise
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-normal text-foreground">Machine learning</h2>
                  <Button variant="link" className="text-primary">
                    View all (16)
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
