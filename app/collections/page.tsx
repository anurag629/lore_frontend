'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCollections } from '@/hooks/useCollections';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Plus, 
  Image as ImageIcon, 
  Lock, 
  Globe,
  FolderOpen,
  Compass,
  User,
  Sparkles
} from 'lucide-react';
import CollectionModal from '@/components/collections/CollectionModal';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

type TabType = 'my' | 'discover';

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get current tab from URL, default to 'my' for authenticated users, 'discover' for guests
  const currentTab = (searchParams.get('tab') as TabType) || (isAuthenticated ? 'my' : 'discover');
  
  // Switch tab handler - updates URL
  const switchTab = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/collections?${params.toString()}`);
  };
  
  // Memoize params based on current tab
  const collectionsParams = useMemo(() => {
    if (currentTab === 'my' && user) {
      return { creator: user.id };
    }
    // For discover tab, fetch only public collections
    return { is_public: true };
  }, [currentTab, user?.id]);
  
  // Fetch collections based on tab
  const { data: collections, isLoading, error } = useCollections(
    // Only fetch 'my' collections if authenticated
    currentTab === 'my' && !isAuthenticated ? undefined : collectionsParams
  );

  // Filter out user's own collections from discover tab
  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    if (currentTab === 'discover' && user) {
      return collections.filter(c => c.creator.id !== user.id);
    }
    return collections;
  }, [collections, currentTab, user?.id]);

  // Redirect to discover tab if not authenticated and trying to view 'my' collections
  if (!authLoading && !isAuthenticated && currentTab === 'my') {
    router.push('/collections?tab=discover');
    return null;
  }

  const isLoadingState = authLoading || isLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Collections
          </h1>
          <p className="text-slate-400">
            {currentTab === 'my' 
              ? 'Organize and showcase your favorite assets' 
              : 'Discover curated collections from the community'}
          </p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        {isAuthenticated && (
          <button
            onClick={() => switchTab('my')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              currentTab === 'my'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>My Collections</span>
          </button>
        )}
        <button
          onClick={() => switchTab('discover')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            currentTab === 'discover'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoadingState && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading collections...</p>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {!isLoadingState && filteredCollections && filteredCollections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group relative bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-amber-600/20 to-orange-600/20 overflow-hidden">
                {collection.cover_image_url ? (
                  <OptimizedImage
                    src={collection.cover_image_url}
                    alt={collection.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FolderOpen className="w-16 h-16 text-amber-500/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {collection.is_public ? (
                    <div className="bg-green-500/20 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Globe className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Public</span>
                    </div>
                  ) : (
                    <div className="bg-slate-800/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">Private</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                
                {/* Show creator info in discover tab */}
                {currentTab === 'discover' && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                      {collection.creator.avatar_url ? (
                        <img
                          src={collection.creator.avatar_url}
                          alt={collection.creator.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-slate-400 truncate">
                      {collection.creator.display_name || `${collection.creator.wallet_address.slice(0, 6)}...${collection.creator.wallet_address.slice(-4)}`}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{collection.asset_count} asset{collection.asset_count !== 1 ? 's' : ''}</span>
                  <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty States */}
      {!isLoadingState && (!filteredCollections || filteredCollections.length === 0) && (
        <>
          {currentTab === 'my' ? (
            <EmptyState
              icon={FolderOpen}
              title="No Collections Yet"
              description="Create your first collection to organize your favorite assets"
              action={{
                label: "Create Collection",
                onClick: () => setIsModalOpen(true)
              }}
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No Public Collections"
              description="Be the first to share a collection with the community!"
              action={isAuthenticated ? {
                label: "Create Public Collection",
                onClick: () => setIsModalOpen(true)
              } : undefined}
            />
          )}
        </>
      )}

      {/* Create Collection Modal */}
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
