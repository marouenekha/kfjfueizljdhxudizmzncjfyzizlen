import { Layout } from "@/components/Layout/Layout";
import { Users } from "lucide-react";

export default function Feed() {
  return (
    <Layout title="ServiceHub" showMenu={true}>
      <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Feed</h1>
            <p className="text-muted-foreground">Discover services from the community</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Welcome to ServiceHub</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Connect with service providers in your community.
          </p>
        </div>
      </div>
    </Layout>
  );
}