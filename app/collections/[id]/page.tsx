'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCollection, useRemoveAssetFromCollection } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Globe,
  Lock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id ? parseInt(params.id as string) : null;
  const { data: collection, isLoading, error } = useCollection(collectionId || 0);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const removeAsset = useRemoveAssetFromCollection();

  const isOwner = collection && user && collection.creator.id === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Collection Not Found</h2>
          <p className="text-slate-400 mb-4">
            {error?.message || 'This collection does not exist or is private.'}
          </p>
          <Button onClick={() => router.push('/collections')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const handleRemoveAsset = async (assetId: number) => {
    if (!isOwner) return;
    
    if (confirm('Remove this asset from the collection?')) {
      try {
        await removeAsset.mutateAsync({
          collectionId: collection.id,
          assetId,
        });
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="mt-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div>
            {/* Cover Image */}
            {collection.cover_image_url && (
              <div className="w-32 h-32 rounded-xl overflow-hidden mb-4 border border-slate-800">
                <OptimizedImage
                  src={collection.cover_image_url}
                  alt={collection.title}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white">{collection.title}</h1>
              {collection.is_public ? (
                <div className="bg-green-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Public</span>
                </div>
              ) : (
                <div className="bg-slate-800 px-3 py-1 rounded-lg flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">Private</span>
                </div>
              )}
            </div>
            
            {collection.description && (
              <p className="text-slate-400 text-lg mb-4">{collection.description}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link
                href={`/profile/${collection.creator.wallet_address}`}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{collection.creator.display_name || collection.creator.wallet_address.slice(0, 8)}</span>
              </Link>
              <span>{collection.asset_count} asset{collection.asset_count !== 1 ? 's' : ''}</span>
              <span>{new Date(collection.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {collection.assets && collection.assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.assets.map((asset: any) => (
            <div
              key={asset.id}
              className="group relative bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:border-amber-500/50 transition-all duration-300"
            >
              <Link href={`/explore/${asset.id}`}>
                <div className="relative h-48 bg-gradient-to-br from-amber-600/20 to-orange-600/20 overflow-hidden">
                  <OptimizedImage
                    src={asset.media_url}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {asset.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{asset.derivative_count || 0} derivatives</span>
                    <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
              
              {/* Remove Button (Owner only) */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveAsset(asset.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={removeAsset.isPending}
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No Assets in Collection"
          description="This collection is empty. Add assets to get started!"
        />
      )}
    </div>
  );
}

