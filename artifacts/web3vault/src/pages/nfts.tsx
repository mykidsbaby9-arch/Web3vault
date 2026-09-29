import { useState } from "react"
import { useGetNftCollections, useGetNfts, useGetNftDetail, getGetNftCollectionsQueryKey, getGetNftsQueryKey, getGetNftDetailQueryKey } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletGateButton } from "@/components/shared/wallet-gate"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Image as ImageIcon, ExternalLink, Activity } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { Skeleton } from "@/components/ui/skeleton"

export default function NFTs() {
  const { address } = useWallet()
  const [selectedNft, setSelectedNft] = useState<number | null>(null)

  const { data: collections, isLoading: isLoadingCols } = useGetNftCollections({
    query: { queryKey: getGetNftCollectionsQueryKey() }
  })
  
  const { data: nfts, isLoading: isLoadingNfts } = useGetNfts(
    { address: address || "" },
    { query: { enabled: !!address, queryKey: getGetNftsQueryKey({ address: address || "" }) } }
  )

  const { data: nftDetail, isLoading: isLoadingDetail } = useGetNftDetail(
    selectedNft!,
    { query: { enabled: !!selectedNft, queryKey: getGetNftDetailQueryKey(selectedNft!) } }
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-purple-400" /> Digital Collectibles
        </h1>
        <p className="text-white/60 mt-1">Manage and value your NFT portfolio across networks.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="glass-panel border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />
            <CardContent className="p-6 relative z-10">
              <div className="text-white/40 text-sm uppercase mb-2">Estimated Value</div>
              <div className="text-3xl font-bold font-mono text-purple-400">
                {nfts ? `~${nfts.reduce((acc, nft) => acc + (nft.lastSalePrice || nft.floorPrice), 0).toFixed(2)} ETH` : '0.00 ETH'}
              </div>
            </CardContent>
         </Card>
         <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="text-white/40 text-sm uppercase mb-2">Total NFTs</div>
              <div className="text-3xl font-bold font-mono text-white">{nfts?.length || 0}</div>
            </CardContent>
         </Card>
         <Card className="glass-panel border-white/5">
            <CardContent className="p-6">
              <div className="text-white/40 text-sm uppercase mb-2">Collections</div>
              <div className="text-3xl font-bold font-mono text-white">{new Set(nfts?.map(n => n.collection)).size || 0}</div>
            </CardContent>
         </Card>
      </div>

      {/* Top Collections */}
      <div>
        <h3 className="text-lg font-bold mb-4">Trending Collections</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {isLoadingCols ? (
            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="min-w-[280px] h-20 rounded-xl bg-white/5" />)
          ) : collections?.map((col) => (
            <div key={col.slug} className="min-w-[280px] p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 flex items-center gap-4 transition-colors cursor-pointer">
               <img src={col.imageUrl} alt={col.name} className="w-14 h-14 rounded-lg object-cover" />
               <div className="flex-1">
                 <div className="font-bold text-sm truncate">{col.name}</div>
                 <div className="flex justify-between mt-1 text-xs">
                   <span className="text-white/40">Floor</span>
                   <span className="font-mono text-white/80">{col.floorPrice} ETH</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-lg font-bold mb-4">Your Gallery</h3>
        {isLoadingNfts ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {Array.from({length: 10}).map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-xl bg-white/5" />)}
          </div>
        ) : !nfts || nfts.length === 0 ? (
          <div className="text-center py-24 glass-panel border border-white/5 rounded-2xl">
             <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-white/60">No NFTs found</h3>
             <p className="text-sm text-white/40 mt-1">Connect a wallet with digital collectibles to view them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {nfts.map((nft) => (
              <Card 
                key={nft.id} 
                className="glass-panel border-white/5 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all cursor-pointer overflow-hidden group"
                onClick={() => setSelectedNft(nft.id)}
              >
                <div className="aspect-square relative overflow-hidden bg-black/60">
                  <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <div className="text-xs text-white/40 truncate mb-1">{nft.collection}</div>
                  <div className="font-bold text-sm truncate">{nft.name}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* NFT Detail Modal */}
      <Dialog open={!!selectedNft} onOpenChange={(open) => !open && setSelectedNft(null)}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-[#0B1220] border-white/10 gap-0">
          {isLoadingDetail || !nftDetail ? (
            <div className="h-[600px] flex items-center justify-center">Loading details...</div>
          ) : (
            <div className="flex flex-col md:flex-row h-full max-h-[80vh]">
               <div className="w-full md:w-1/2 bg-black/50 p-6 flex flex-col items-center justify-center border-r border-white/5">
                 <img src={nftDetail.imageUrl} alt={nftDetail.name} className="w-full max-w-sm rounded-xl shadow-2xl" />
               </div>
               <div className="w-full md:w-1/2 p-6 overflow-y-auto">
                 <DialogHeader className="mb-6">
                   <div className="text-sm text-purple-400 font-medium mb-1">{nftDetail.collection}</div>
                   <DialogTitle className="text-2xl">{nftDetail.name}</DialogTitle>
                 </DialogHeader>
                 
                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                     <div className="text-xs text-white/40 uppercase mb-1">Floor Price</div>
                     <div className="font-mono text-lg font-bold">{nftDetail.floorPrice} ETH</div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                     <div className="text-xs text-white/40 uppercase mb-1">Last Sale</div>
                     <div className="font-mono text-lg font-bold">{nftDetail.lastSalePrice ? `${nftDetail.lastSalePrice} ETH` : 'N/A'}</div>
                   </div>
                 </div>

                 {nftDetail.traits && nftDetail.traits.length > 0 && (
                   <div>
                     <h4 className="font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Properties</h4>
                     <div className="grid grid-cols-2 gap-3">
                       {nftDetail.traits.map((trait, i) => (
                         <div key={i} className="bg-primary/5 border border-primary/20 p-2.5 rounded-lg text-center">
                           <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">{trait.traitType}</div>
                           <div className="text-sm font-medium truncate" title={trait.value}>{trait.value}</div>
                           <div className="text-[10px] text-white/40 mt-1">{trait.rarity}% have this</div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 <div className="mt-8 flex gap-3">
                   <WalletGateButton className="flex-1 bg-purple-600 hover:bg-purple-700" action="list this NFT for sale">List for Sale</WalletGateButton>
                   <WalletGateButton variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10" action="transfer this NFT">Transfer</WalletGateButton>
                   <Button variant="outline" size="icon" className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10">
                     <ExternalLink className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}