'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Coins, ExternalLink, Box, Shield, LinkIcon, CheckCircle, Hash, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Transaction {
  id: string;
  participant_id: string;
  event_id: string | null;
  amount: number;
  transaction_type: 'credit' | 'debit' | 'mint' | 'spend';
  description: string;
  transaction_hash: string;
  created_at: string;
  block_id?: string;
}

interface Block {
  id: string;
  block_number: number;
  previous_hash: string;
  merkle_root: string;
  timestamp: string;
  nonce: number;
  difficulty: number;
  hash: string;
  transactions?: Transaction[];
}

export function PointsHistoryClient({ userId }: { userId: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockLoading, setBlockLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  // Fetch points balance and transaction history
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
        
        // Fetch blockchain blocks
        setBlockLoading(true);
        try {
          const blocksRes = await fetch(`/api/blockchain/blocks`);
          if (blocksRes.ok) {
            const blocksData = await blocksRes.json();
            setBlocks(blocksData.blocks || []);
            setBlockError(null);
          } else {
            setBlockError('Failed to fetch blockchain data');
          }
        } catch (err: any) {
          console.error('Error fetching blockchain blocks:', err);
          setBlockError(err.message || 'Failed to load blockchain data');
        } finally {
          setBlockLoading(false);
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

  // Function to verify a transaction on the blockchain
  const verifyTransaction = async (transaction: Transaction) => {
    try {
      setSelectedTransaction(transaction);
      setVerifyLoading(true);
      
      const res = await fetch(`/api/blockchain/verify?hash=${transaction.transaction_hash}`);
      if (!res.ok) throw new Error('Failed to verify transaction');
      
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      console.error('Error verifying transaction:', err);
      setVerificationResult({ 
        verified: false, 
        error: err.message || 'Failed to verify transaction' 
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const showBlockDetails = (block: Block) => {
    // Find transactions in this block
    const blockTransactions = transactions.filter(tx => tx.block_id === block.id);
    setSelectedBlock({
      ...block,
      transactions: blockTransactions
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Points History</h1>
          <p className="text-muted-foreground mb-8">View your blockchain point transactions and verification details</p>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Points History</h1>
          <p className="text-muted-foreground mb-8">View your blockchain point transactions and verification details</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Points Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Points History</h1>
        <p className="text-muted-foreground mb-8">View your blockchain point transactions and verification details</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Point Balance
            </CardTitle>
            <CardDescription>Your blockchain points for event discounts</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{balance}</div>
              <div className="text-sm text-muted-foreground mb-1">points available</div>
              <div className="text-xs text-muted-foreground">Value: {((balance || 0) * 0.1).toFixed(2)} in discounts</div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Badge variant="outline" className="text-xs">
              Secured by Blockchain
            </Badge>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All your point transactions on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Points are awarded when your event registrations are approved.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Verify</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    // Determine if the transaction is a credit ('mint') or debit ('spend')
                    const isCredit = tx.transaction_type === 'mint'; 
                    
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{tx.description || (isCredit ? 'Points Awarded' : 'Points Spent')}</TableCell>
                        <TableCell>
                          <span className={`flex items-center ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                            {isCredit ? (
                              <ArrowUpCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownCircle className="h-4 w-4 mr-1" />
                            )}
                            {isCredit ? '+' : '-'}{Math.abs(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => verifyTransaction(tx)}
                                className="flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" /> Verify
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Transaction Verification</DialogTitle>
                                <DialogDescription>
                                  Verifying the integrity of the transaction on the blockchain.
                                </DialogDescription>
                              </DialogHeader>
                              {verifyLoading ? (
                                <div className="flex justify-center items-center p-8">
                                  <Skeleton className="h-8 w-8 rounded-full mr-2 animate-spin" /> Verifying...
                                </div>
                              ) : verificationResult ? (
                                <div className="space-y-4 mt-4">
                                  <div><strong>Status:</strong> <Badge variant={verificationResult.verified ? 'default' : 'destructive'}>{verificationResult.verified ? 'Verified' : 'Failed'}</Badge></div>
                                  {selectedTransaction && (
                                    <>
                                      <div><strong>Transaction Hash:</strong> <code className="text-xs break-all">{selectedTransaction.transaction_hash}</code></div>
                                      <div><strong>Amount:</strong> {selectedTransaction.transaction_type === 'mint' ? '+' : '-'}{Math.abs(selectedTransaction.amount)}</div>
                                      <div><strong>Timestamp:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</div>
                                    </>
                                  )}
                                  {verificationResult.message && <div><strong>Details:</strong> {verificationResult.message}</div>}
                                  {verificationResult.error && <div className="text-red-500"><strong>Error:</strong> {verificationResult.error}</div>}
                                  {verificationResult.block && (
                                     <div><strong>Block Number:</strong> {verificationResult.block.block_number}</div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center p-4 text-muted-foreground">Click Verify to check the transaction.</div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Blockchain Explorer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Box className="mr-2 h-5 w-5" />
            Blockchain Explorer
          </CardTitle>
          <CardDescription>Explore the blocks containing your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {blockLoading ? (
            <div className="flex justify-center items-center p-8">
              <Skeleton className="h-8 w-8 rounded-full mr-2 animate-spin" /> Loading Blocks...
            </div>
          ) : blockError ? (
            <div className="flex flex-col items-center justify-center text-center py-8 text-red-500">
              <AlertCircle className="h-10 w-10 mb-3" /> 
              <p className="font-semibold">Failed to fetch blockchain data.</p> 
              <p className="text-sm">({blockError})</p> 
              <p className="text-sm text-muted-foreground mt-2">The API endpoint '/api/blockchain/blocks' might be missing.</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No blockchain blocks found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                The blockchain consists of {blocks.length} blocks, each containing multiple transactions.
              </p>
              
              <div className="relative overflow-x-auto">
                <div className="flex items-start space-x-4 pb-4 overflow-x-auto">
                  {blocks.slice(0, 5).map((block, index) => (
                    <Dialog key={block.id}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="flex flex-col items-center justify-center h-auto min-w-[120px] p-4"
                          onClick={() => showBlockDetails(block)}
                        >
                          <div className="flex items-center mb-2">
                            <Box className="h-5 w-5 mr-1" />
                            <span>Block {block.block_number}</span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {new Date(block.timestamp).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            {block.hash.substring(0, 8)}...
                          </Badge>
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Block #{block.block_number}</DialogTitle>
                          <DialogDescription>
                            Created on {new Date(block.timestamp).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Hash</p>
                              <p className="text-xs text-muted-foreground break-all">
                                {block.hash}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Previous Hash</p>
                              <p className="text-xs text-muted-foreground break-all">
                                {block.previous_hash}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Merkle Root</p>
                              <p className="text-xs text-muted-foreground break-all">
                                {block.merkle_root}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Nonce</p>
                              <p className="text-xs text-muted-foreground">
                                {block.nonce}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <p className="text-sm font-medium mb-2">Transactions in this Block</p>
                            {selectedBlock?.transactions && selectedBlock.transactions.length > 0 ? (
                              <div className="border rounded-md p-2 divide-y">
                                {selectedBlock.transactions.map(tx => (
                                  <div key={tx.id} className="py-2 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        {tx.transaction_type === 'credit' ? (
                                          <ArrowUpCircle className="h-4 w-4 text-green-500 mr-2" />
                                        ) : (
                                          <ArrowDownCircle className="h-4 w-4 text-red-500 mr-2" />
                                        )}
                                        <div>
                                          <p className="text-sm font-medium">{tx.description}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(tx.created_at).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={`${tx.transaction_type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.transaction_type === 'credit' ? '+' : '-'}{Math.abs(tx.amount)}
                                      </span>
                                    </div>
                                    <div className="mt-1">
                                      <p className="text-xs text-muted-foreground flex items-center">
                                        <Hash className="h-3 w-3 mr-1" />
                                        Transaction Hash: {tx.transaction_hash.substring(0, 16)}...
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No transactions of yours in this block.
                              </p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                  
                  {blocks.length > 5 && (
                    <div className="flex items-center justify-center h-auto min-w-[120px] p-4 border border-dashed rounded-md">
                      <p className="text-xs text-muted-foreground">
                        +{blocks.length - 5} more blocks
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 mr-1 text-green-500" />
                    <span>Blockchain Verified & Secured</span>
                    <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Transaction Verification Modal */}
      {selectedTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Verification</CardTitle>
            <CardDescription>
              Blockchain verification for transaction on {" "}
              {new Date(selectedTransaction.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verifyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : verificationResult ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  {verificationResult.verified ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Transaction Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Verification Failed</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Transaction Hash</p>
                    <p className="text-xs border p-2 rounded bg-muted overflow-x-auto">
                      {selectedTransaction.transaction_hash}
                    </p>
                  </div>
                  
                  {verificationResult.blockInfo && (
                    <div>
                      <p className="text-sm font-medium">Block Information</p>
                      <div className="text-xs border p-2 rounded bg-muted space-y-1">
                        <p><span className="font-medium">Block Number:</span> {verificationResult.blockInfo.block_number}</p>
                        <p><span className="font-medium">Timestamp:</span> {new Date(verificationResult.blockInfo.timestamp).toLocaleString()}</p>
                        <p><span className="font-medium">Hash:</span> {verificationResult.blockInfo.hash}</p>
                      </div>
                    </div>
                  )}
                  
                  {verificationResult.error && (
                    <div className="text-red-500 text-sm">
                      <p className="font-medium">Error:</p>
                      <p>{verificationResult.error}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Verification result will appear here.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(null)}>
              Close Verification
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 