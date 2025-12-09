'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  GitBranch,
  FileText,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  Eye,
  ZoomIn,
  ZoomOut,
  Move,
} from 'lucide-react';
import type { IPAssetListItem } from '@/types/api';

interface GenealogyGraphProps {
  assets: IPAssetListItem[];
}

// Custom node component for assets
function AssetNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`relative px-4 py-3 rounded-xl bg-slate-800/90 border-2 transition-all ${
        selected
          ? 'border-amber-500 shadow-lg shadow-amber-500/25'
          : data.isRoot
          ? 'border-amber-500/50'
          : data.isDerivative
          ? 'border-blue-500/50'
          : 'border-slate-700'
      }`}
      style={{ minWidth: 180 }}
    >
      {/* Input handle (for derivatives) */}
      {data.isDerivative && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-500 !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}

      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
          {data.media_url && data.media_url !== 'https://placeholder.example.com/media' ? (
            <img src={data.media_url} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <FileText className="w-5 h-5 text-amber-400" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{data.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {data.derivativeCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <GitBranch className="w-3 h-3" />
                {data.derivativeCount}
              </span>
            )}
            {data.isDerivative && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                Remix
              </span>
            )}
            {data.isRoot && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                Original
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
          data.status === 'registered'
            ? 'bg-green-500'
            : data.status === 'pending' || data.status === 'retrying'
            ? 'bg-yellow-500'
            : 'bg-red-500'
        }`}
      />

      {/* Output handle (for assets with derivatives) */}
      {data.derivativeCount > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-amber-500 !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}
    </div>
  );
}

const nodeTypes = {
  asset: AssetNode,
};

export default function GenealogyGraph({ assets }: GenealogyGraphProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<IPAssetListItem | null>(null);

  // Build graph data from assets using hierarchical tree layout
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Find root assets (not derivatives) and derivatives
    const rootAssets = assets.filter(a => !a.is_derivative);
    const derivativeAssets = assets.filter(a => a.is_derivative);

    // Layout constants
    const NODE_WIDTH = 220;
    const H_SPACING = 280; // Horizontal spacing between siblings
    const V_SPACING = 150; // Vertical spacing between levels

    // Build parent -> children map
    const childrenByParent = new Map<string, IPAssetListItem[]>();
    derivativeAssets.forEach((asset) => {
      const parentId = asset.parent_asset_id;
      if (parentId) {
        if (!childrenByParent.has(parentId)) {
          childrenByParent.set(parentId, []);
        }
        childrenByParent.get(parentId)!.push(asset);
      }
    });

    // Build asset lookup map
    const assetMap = new Map(assets.map(a => [a.id, a]));

    // Track positions for each node
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Calculate subtree width for each node (for proper centering)
    const getSubtreeWidth = (assetId: string): number => {
      const children = childrenByParent.get(assetId) || [];
      if (children.length === 0) {
        return NODE_WIDTH;
      }
      const childWidths = children.map(child => getSubtreeWidth(child.id));
      const totalChildWidth = childWidths.reduce((sum, w) => sum + w, 0) + (children.length - 1) * (H_SPACING - NODE_WIDTH);
      return Math.max(NODE_WIDTH, totalChildWidth);
    };

    // Position a subtree recursively
    const positionSubtree = (assetId: string, x: number, y: number, asset: IPAssetListItem) => {
      const children = childrenByParent.get(assetId) || [];
      const subtreeWidth = getSubtreeWidth(assetId);

      // Center this node over its subtree
      const nodeX = x + (subtreeWidth - NODE_WIDTH) / 2;
      nodePositions.set(assetId, { x: nodeX, y });

      // Create node
      nodes.push({
        id: assetId,
        type: 'asset',
        position: { x: nodeX, y },
        data: {
          title: asset.title,
          media_url: asset.media_url,
          derivativeCount: asset.derivative_count,
          isDerivative: asset.is_derivative,
          isRoot: !asset.is_derivative,
          status: asset.registration_status,
          asset: asset,
        },
      });

      // Position children
      let childX = x;
      children.forEach((child) => {
        const childWidth = getSubtreeWidth(child.id);
        positionSubtree(child.id, childX, y + V_SPACING, child);

        // Create edge from parent to child
        edges.push({
          id: `e-${assetId}-${child.id}`,
          source: assetId,
          target: child.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#f59e0b', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#f59e0b',
          },
        });

        childX += childWidth + (H_SPACING - NODE_WIDTH);
      });
    };

    // Position all root assets and their subtrees
    let currentX = 0;
    rootAssets.forEach((root) => {
      const subtreeWidth = getSubtreeWidth(root.id);
      positionSubtree(root.id, currentX, 0, root);
      currentX += subtreeWidth + H_SPACING;
    });

    // Handle orphan derivatives (derivatives whose parent is not in the asset list)
    const positionedIds = new Set(nodePositions.keys());
    const orphanDerivatives = derivativeAssets.filter(d => !positionedIds.has(d.id));

    if (orphanDerivatives.length > 0) {
      // Position orphans in a separate row below
      const orphanY = rootAssets.length > 0 ? V_SPACING * 2 : 0;
      orphanDerivatives.forEach((asset, index) => {
        const x = index * H_SPACING;
        nodes.push({
          id: asset.id,
          type: 'asset',
          position: { x, y: orphanY },
          data: {
            title: asset.title,
            media_url: asset.media_url,
            derivativeCount: asset.derivative_count,
            isDerivative: true,
            isRoot: false,
            status: asset.registration_status,
            asset: asset,
          },
        });

        // Try to create edge to parent even if parent not visible
        if (asset.parent_asset_id && assetMap.has(asset.parent_asset_id)) {
          edges.push({
            id: `e-${asset.parent_asset_id}-${asset.id}`,
            source: asset.parent_asset_id,
            target: asset.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
            },
          });
        }
      });
    }

    return { nodes, edges };
  }, [assets]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when assets change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.asset);
  }, []);

  // Empty state
  if (assets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 sm:p-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Asset Genealogy</h2>
        <div className="bg-slate-800/30 rounded-lg p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-base text-slate-400">No assets to visualize</p>
            <p className="text-sm text-slate-500 mt-2">
              Mint your first asset to see the genealogy graph
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Asset Genealogy</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Visualize derivative relationships across your IP portfolio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Expand</span>
            </button>
          </div>
        </div>

        {/* Graph Container */}
        <div className="h-[400px] relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls
              className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
              showInteractive={false}
              position="bottom-right"
            />
          </ReactFlow>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg p-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400">Original</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-400">Derivative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-amber-500" />
                <span className="text-slate-400">Lineage</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg p-2 text-xs text-slate-500 flex items-center gap-2">
            <Move className="w-3 h-3" />
            Drag to pan
            <ZoomIn className="w-3 h-3 ml-2" />
            Scroll to zoom
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-4 border-t border-slate-800/50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              <strong className="text-white">{assets.filter(a => !a.is_derivative).length}</strong> originals
            </span>
            <span>
              <strong className="text-white">{assets.filter(a => a.is_derivative).length}</strong> derivatives
            </span>
          </div>
          <span className="text-slate-500">Click a node to view details</span>
        </div>
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm"
          >
            {/* Close button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-2xl font-bold text-white">Asset Genealogy</h2>
              <p className="text-slate-400 text-sm">Interactive network visualization</p>
            </div>

            {/* Full-screen Graph */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#334155" gap={20} size={1} />
              <Controls
                className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
                position="bottom-right"
              />
            </ReactFlow>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg p-4">
              <p className="text-sm font-medium text-white mb-3">Legend</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-amber-500/50 bg-slate-800" />
                  <span className="text-slate-400">Original Asset</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border-2 border-blue-500/50 bg-slate-800" />
                  <span className="text-slate-400">Derivative Asset</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-0.5 bg-amber-500" />
                  <span className="text-slate-400">Parent → Child Relationship</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node Detail Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Close */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Asset Image */}
              <div className="w-full aspect-square bg-slate-800 rounded-xl overflow-hidden mb-4">
                {selectedNode.media_url && selectedNode.media_url !== 'https://placeholder.example.com/media' ? (
                  <img
                    src={selectedNode.media_url}
                    alt={selectedNode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-16 h-16 text-amber-400" />
                  </div>
                )}
              </div>

              {/* Asset Info */}
              <h3 className="text-xl font-bold text-white mb-2">{selectedNode.title}</h3>

              <div className="flex items-center gap-2 mb-4">
                {selectedNode.is_derivative ? (
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                    Derivative
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
                    Original
                  </span>
                )}
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    selectedNode.registration_status === 'registered'
                      ? 'bg-green-500/20 text-green-400'
                      : selectedNode.registration_status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {selectedNode.registration_status || 'Unknown'}
                </span>
              </div>

              {selectedNode.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-3">
                  {selectedNode.description}
                </p>
              )}

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Derivatives</span>
                  <span className="text-white font-medium">{selectedNode.derivative_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Remixable</span>
                  <span className={selectedNode.allow_derivatives ? 'text-green-400' : 'text-red-400'}>
                    {selectedNode.allow_derivatives ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Commercial</span>
                  <span className={selectedNode.commercial_rights ? 'text-green-400' : 'text-red-400'}>
                    {selectedNode.commercial_rights ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Link
                href={`/explore/${selectedNode.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Asset Details
              </Link>

              {selectedNode.story_ip_id && (
                <a
                  href={`https://explorer.story.foundation/ipa/${selectedNode.story_ip_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Story Explorer
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
