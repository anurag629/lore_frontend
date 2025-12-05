'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCollections } from '@/hooks/useCollections';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Plus, 
  Image as ImageIcon, 
  Lock, 
  Globe,
  FolderOpen
} from 'lucide-react';
import CollectionModal from '@/components/collections/CollectionModal';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { EmptyState } from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';

export default function CollectionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Memoize params to prevent unnecessary re-renders
  const collectionsParams = useMemo(
    () => (user ? { creator: user.id } : undefined),
    [user?.id]
  );
  
  // Fetch user's collections
  const { data: collections, isLoading, error } = useCollections(collectionsParams);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            My Collections
          </h1>
          <p className="text-slate-400">Organize and showcase your favorite assets</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Collection
        </Button>
      </div>

      {/* Collections Grid */}
      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
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
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{collection.asset_count} asset{collection.asset_count !== 1 ? 's' : ''}</span>
                  <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No Collections Yet"
          description="Create your first collection to organize your favorite assets"
          action={{
            label: "Create Collection",
            onClick: () => setIsModalOpen(true)
          }}
        />
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

