import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Coins, 
  FileText, 
  Shield, 
  TrendingUp, 
  Users, 
  Wallet,
  Award,
  DollarSign,
  Zap,
  Globe,
  Lock,
  Star
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  contractAddress?: string;
}

interface SmartContract {
  id: string;
  loadId: number;
  shipper: string;
  driver: string;
  rate: number;
  status: string;
  escrowAmount: number;
  contractAddress: string;
}

interface DriverNFT {
  tokenId: number;
  driverId: number;
  metadata: {
    licenseNumber: string;
    safetyRating: number;
    completedLoads: number;
    specialCertifications: string[];
    experienceYears: number;
  };
  tier: string;
  benefits: string[];
  mintDate: string;
}

interface StakingPool {
  poolId: string;
  totalStaked: number;
  apy: number;
  lockPeriod: number;
  rewardsDistributed: number;
  isActive: boolean;
}

interface Web3Stats {
  tokenInfo: TokenInfo;
  totalValueLocked: number;
  totalTransactionVolume: number;
  activeContracts: number;
  mintedNFTs: number;
  stakingParticipants: number;
  averageAPY: number;
  currentTokenValue: number;
}

export default function Web3BlockchainDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState("premium_features");

  // Fetch Web3 stats
  const { data: stats, isLoading: statsLoading } = useQuery<Web3Stats>({
    queryKey: ['/api/web3/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch smart contracts
  const { data: contracts, isLoading: contractsLoading } = useQuery<SmartContract[]>({
    queryKey: ['/api/web3/smart-contracts']
  });

  // Fetch driver NFTs
  const { data: nfts, isLoading: nftsLoading } = useQuery<DriverNFT[]>({
    queryKey: ['/api/web3/driver-nfts']
  });

  // Fetch staking pools
  const { data: stakingPools, isLoading: poolsLoading } = useQuery<StakingPool[]>({
    queryKey: ['/api/web3/staking-pools']
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ['/api/web3/transactions']
  });

  // Stake tokens mutation
  const stakeTokensMutation = useMutation({
    mutationFn: async (data: { userAddress: string; amount: number; poolId: string }) => {
      return await apiRequest('/api/web3/stake-tokens', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Tokens Staked Successfully",
        description: `Staked ${stakeAmount} TRUCK tokens in ${selectedPool} pool`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/staking-pools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/web3/stats'] });
      setStakeAmount("");
    },
    onError: () => {
      toast({
        title: "Staking Failed",
        description: "Failed to stake tokens. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStakeTokens = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake",
        variant: "destructive",
      });
      return;
    }

    stakeTokensMutation.mutate({
      userAddress: "0x1234567890123456789012345678901234567890",
      amount: parseFloat(stakeAmount),
      poolId: selectedPool
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'created': 'bg-blue-500',
      'accepted': 'bg-yellow-500',
      'in_transit': 'bg-purple-500',
      'delivered': 'bg-green-500',
      'paid': 'bg-emerald-500',
      'disputed': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'bronze': 'bg-amber-600',
      'silver': 'bg-gray-400',
      'gold': 'bg-yellow-500',
      'platinum': 'bg-purple-500'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-500';
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading Web3 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Web3 Blockchain Dashboard</h1>
        <p className="text-lg text-gray-600">
          Comprehensive blockchain integration with smart contracts, NFTs, and cryptocurrency payments
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TRUCK Token Value</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.currentTokenValue.toFixed(4) || '0.0000'}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalValueLocked.toLocaleString() || '0'} TRUCK</div>
            <p className="text-xs text-muted-foreground">
              ${((stats?.totalValueLocked || 0) * (stats?.currentTokenValue || 0)).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Smart load contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver NFTs</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.mintedNFTs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Minted credentials
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="nfts">Driver NFTs</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  TRUCK Token Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Token Symbol</Label>
                    <p className="text-lg font-bold">{stats?.tokenInfo.symbol}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Supply</Label>
                    <p className="text-lg font-bold">100M TRUCK</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Network</Label>
                    <p className="text-lg font-bold">Polygon</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Contract</Label>
                    <p className="text-sm font-mono">0x742d...4e8f</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Circulating Supply</span>
                    <span className="font-semibold">10M TRUCK (10%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staked Amount</span>
                    <span className="font-semibold">{stats?.totalValueLocked.toLocaleString()} TRUCK</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Cap</span>
                    <span className="font-semibold">${((stats?.totalValueLocked || 0) * (stats?.currentTokenValue || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Web3 Advantages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Instant Payments</p>
                      <p className="text-sm text-gray-600">No 30-90 day payment delays</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Lower Fees</p>
                      <p className="text-sm text-gray-600">2-3% vs 10-15% traditional brokers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">Global Access</p>
                      <p className="text-sm text-gray-600">Borderless blockchain operations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">Fraud Protection</p>
                      <p className="text-sm text-gray-600">Smart contract guarantees</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-blue-900">Revenue Enhancement</p>
                  <p className="text-sm text-blue-700">Web3 features increase platform revenue by 88% through token economics</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Smart Load Contracts
              </CardTitle>
              <CardDescription>
                Automated contracts with escrow and instant payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="text-center py-8">Loading contracts...</div>
              ) : (
                <div className="space-y-4">
                  {contracts?.map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="font-medium">Load #{contract.loadId}</span>
                        </div>
                        <span className="text-lg font-bold">${contract.rate.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Shipper</Label>
                          <p className="font-mono">{contract.shipper.slice(0, 10)}...</p>
                        </div>
                        <div>
                          <Label>Driver</Label>
                          <p className="font-mono">{contract.driver.slice(0, 10)}...</p>
                        </div>
                        <div>
                          <Label>Escrow Amount</Label>
                          <p className="font-semibold">${contract.escrowAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label>Contract Address</Label>
                          <p className="font-mono">{contract.contractAddress.slice(0, 10)}...</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Driver Credential NFTs
              </CardTitle>
              <CardDescription>
                Blockchain-verified driver credentials and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nftsLoading ? (
                <div className="text-center py-8">Loading NFTs...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nfts?.map((nft) => (
                    <div key={nft.tokenId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getTierColor(nft.tier)}>
                          {nft.tier.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">Token #{nft.tokenId}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{nft.metadata.safetyRating}/5 Safety Rating</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{nft.metadata.completedLoads.toLocaleString()} loads completed</p>
                          <p>{nft.metadata.experienceYears} years experience</p>
                          <p>{nft.metadata.specialCertifications.join(', ')}</p>
                        </div>
                        <div className="pt-2">
                          <Label className="text-sm font-medium">Benefits:</Label>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {nft.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staking Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Stake TRUCK Tokens
                </CardTitle>
                <CardDescription>
                  Earn rewards by staking your TRUCK tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stakeAmount">Amount to Stake</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    placeholder="Enter amount in TRUCK"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poolSelect">Select Pool</Label>
                  <select
                    id="poolSelect"
                    className="w-full p-2 border rounded"
                    value={selectedPool}
                    onChange={(e) => setSelectedPool(e.target.value)}
                  >
                    <option value="premium_features">Premium Features (12% APY)</option>
                    <option value="governance_voting">Governance Voting (8% APY)</option>
                  </select>
                </div>
                <Button 
                  onClick={handleStakeTokens}
                  disabled={stakeTokensMutation.isPending}
                  className="w-full"
                >
                  {stakeTokensMutation.isPending ? "Staking..." : "Stake Tokens"}
                </Button>
              </CardContent>
            </Card>

            {/* Staking Pools */}
            <Card>
              <CardHeader>
                <CardTitle>Active Staking Pools</CardTitle>
              </CardHeader>
              <CardContent>
                {poolsLoading ? (
                  <div className="text-center py-8">Loading pools...</div>
                ) : (
                  <div className="space-y-4">
                    {stakingPools?.map((pool) => (
                      <div key={pool.poolId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium capitalize">
                            {pool.poolId.replace('_', ' ')}
                          </h3>
                          <Badge variant="secondary">{pool.apy}% APY</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Total Staked</Label>
                            <p className="font-semibold">{pool.totalStaked.toLocaleString()} TRUCK</p>
                          </div>
                          <div>
                            <Label>Lock Period</Label>
                            <p className="font-semibold">{pool.lockPeriod} days</p>
                          </div>
                          <div>
                            <Label>Rewards Distributed</Label>
                            <p className="font-semibold">{pool.rewardsDistributed.toLocaleString()} TRUCK</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge variant={pool.isActive ? "default" : "secondary"}>
                              {pool.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Recent blockchain transactions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : (
                <div className="space-y-3">
                  {transactions?.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{tx.type.replace('_', ' ').toUpperCase()}</Badge>
                        <div>
                          <p className="font-medium">{tx.amount} {tx.currency}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={tx.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {tx.status}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          Gas: {tx.gasFee.toFixed(4)} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Instant Payments</p>
                      <p className="text-sm text-gray-600">Get paid immediately upon delivery confirmation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Lower Transaction Fees</p>
                      <p className="text-sm text-gray-600">Save 85% on payment processing fees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">NFT Credentials</p>
                      <p className="text-sm text-gray-600">Portable reputation that works everywhere</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Staking Rewards</p>
                      <p className="text-sm text-gray-600">Earn 8-12% APY on token holdings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Increased Retention</p>
                      <p className="text-sm text-gray-600">Token holders 3x more likely to stay</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Global Expansion</p>
                      <p className="text-sm text-gray-600">Borderless blockchain enables worldwide growth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-rose-600" />
                    <div>
                      <p className="font-medium">Revenue Growth</p>
                      <p className="text-sm text-gray-600">+88% revenue increase through token economics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Competitive Advantage</p>
                      <p className="text-sm text-gray-600">First comprehensive Web3 trucking platform</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}