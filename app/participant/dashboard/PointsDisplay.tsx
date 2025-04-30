'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, ExternalLink, ArrowDownCircle, ArrowUpCircle, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from 'next/link';

interface Transaction {
  id: string;
  participant_id: string;
  event_id: string | null;
  amount: number;
  transaction_type: 'credit' | 'debit';
  description: string;
  transaction_hash: string;
  created_at: string;
}

interface BlockchainStatusProps {
  lastVerifiedBlock?: string;
}

// New component to display blockchain status
function BlockchainStatus({ lastVerifiedBlock }: BlockchainStatusProps) {
  return (
    <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center cursor-help">
              <Shield className="h-3 w-3 mr-1 text-green-500" />
              <span>Blockchain Verified</span>
              {lastVerifiedBlock && <CheckCircle className="h-3 w-3 ml-1 text-green-500" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your points are secured by blockchain technology</p>
            <p className="text-xs">Each transaction is cryptographically verified</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function PointsDisplay({ userId }: { userId: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastBlock, setLastBlock] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchPointsData() {
      try {
        setLoading(true);
        
        // Fetch balance
        const balanceRes = await fetch(`/api/blockchain/balance?participantId=${userId}`);
        if (!balanceRes.ok) throw new Error('Failed to fetch balance');
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance || 0);
        
        // Fetch transactions
        const transactionsRes = await fetch(`/api/blockchain/transactions?participantId=${userId}`);
        if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
        
        // Set last block if available
        if (transactionsData.lastBlock) {
          setLastBlock(transactionsData.lastBlock);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching points data:', err);
        setError(err.message || 'Failed to load points data');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchPointsData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            Point Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          Point Balance
        </CardTitle>
        <CardDescription>Your blockchain points for event discounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="text-4xl font-bold mb-2">{balance}</div>
          <div className="text-sm text-muted-foreground mb-1">points available</div>
          <div className="text-xs text-muted-foreground mb-4">Value: {((balance || 0) * 0.1).toFixed(2)} in discounts</div>
          
          <Link href="/participant/points">
            <Button variant="outline" className="mb-2 w-full">
              View Point Details
            </Button>
          </Link>
          
          <BlockchainStatus lastVerifiedBlock={lastBlock} />
        </div>
        
        {transactions.length > 0 && (
          <Tabs defaultValue="recent" className="w-full mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="recent" className="flex-1">Recent Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="space-y-2 mt-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    {tx.transaction_type === 'credit' ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="text-sm font-medium truncate max-w-[180px]">
                        {tx.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-semibold ${tx.transaction_type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.transaction_type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                    </span>
                    <Link href={`/api/blockchain/verify?hash=${tx.transaction_hash}`} target="_blank" className="ml-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              ))}
              {transactions.length > 3 && (
                <Link href="/participant/points" className="text-xs text-blue-500 hover:underline mt-2 block text-center">
                  View all transactions
                </Link>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Badge variant="outline" className="text-xs">
          Secured by Blockchain
        </Badge>
      </CardFooter>
    </Card>
  );
} 