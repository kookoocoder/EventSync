'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Coins, ExternalLink, ArrowUpCircle, ArrowDownCircle, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Transaction {
  id: string;
  participant_id: string;
  amount: number;
  transaction_type: 'credit' | 'debit' | 'mint' | 'spend';
  description: string;
  transaction_hash: string;
  created_at: string;
}

export function PointsDisplay({ userId }: { userId: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    async function fetchPointsData() {
      try {
        setLoading(true);
        
        // Fetch balance
        const balanceRes = await fetch(`/api/blockchain/balance?participantId=${userId}`);
        if (!balanceRes.ok) throw new Error('Failed to fetch balance');
        const balanceData = await balanceRes.json();
        setBalance(balanceData.balance || 0);
        
        // Fetch transactions - limit to recent transactions
        const transactionsRes = await fetch(`/api/blockchain/transactions?participantId=${userId}&limit=5`);
        if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
        
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

  if (loading) {
    return (
      <Card className="h-full border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </CardTitle>
          <CardDescription><Skeleton className="h-3 w-40" /></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Point Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-2" size="sm" variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          Point Balance
        </CardTitle>
        <CardDescription>Blockchain-verified points for discounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center text-center p-2">
          <div className="bg-primary/10 rounded-full p-4 mb-3">
            <Coins className="h-8 w-8 text-primary" />
          </div>
          <div className="text-4xl font-bold">{balance}</div>
          <div className="text-sm text-muted-foreground mt-1">points available</div>
          <div className="text-xs text-muted-foreground">
            Value: {((balance || 0) * 0.1).toFixed(2)} in discounts
          </div>
          
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 mr-1 text-green-500" />
            <span>Blockchain Verified</span>
            <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
          </div>
        </div>
        
        <Link href="/participant/points">
          <Button variant="outline" size="sm" className="w-full">
            View Full Transaction History
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </Link>
        
        {transactions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recent Transactions</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 3).map((tx) => {
                  const isCredit = tx.transaction_type === 'mint' || tx.transaction_type === 'credit'; 
                  
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[130px] truncate text-xs">
                        {tx.description || (isCredit ? 'Points Awarded' : 'Points Spent')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`px-2 py-0 h-auto text-xs font-medium ${isCredit ? 'text-green-500' : 'text-red-500'}`}
                            >
                              <span className="flex items-center">
                                {isCredit ? (
                                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownCircle className="h-3 w-3 mr-1" />
                                )}
                                {isCredit ? '+' : '-'}{Math.abs(tx.amount)}
                              </span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 py-4 text-sm">
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-muted-foreground">Transaction ID:</div>
                                <div className="col-span-2 font-mono text-xs truncate">{tx.id}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-muted-foreground">Date:</div>
                                <div className="col-span-2">{new Date(tx.created_at).toLocaleString()}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-muted-foreground">Description:</div>
                                <div className="col-span-2">{tx.description}</div>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-muted-foreground">Amount:</div>
                                <div className={`col-span-2 font-medium ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                  {isCredit ? '+' : '-'}{Math.abs(tx.amount)}
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-muted-foreground">Hash:</div>
                                <div className="col-span-2 font-mono text-xs truncate">{tx.transaction_hash}</div>
                              </div>
                            </div>
                            <Button 
                              onClick={() => verifyTransaction(tx)}
                              disabled={verifyLoading}
                              className="w-full"
                            >
                              {verifyLoading ? 'Verifying...' : 'Verify on Blockchain'}
                            </Button>
                            {verificationResult && selectedTransaction?.id === tx.id && (
                              <div className={`mt-2 p-2 text-sm rounded ${verificationResult.verified ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {verificationResult.verified 
                                  ? 'Transaction successfully verified on blockchain' 
                                  : verificationResult.error || 'Failed to verify transaction'}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {transactions.length > 3 && (
              <div className="text-center mt-2">
                <Link href="/participant/points" className="text-xs text-primary hover:underline">
                  View all transactions
                </Link>
              </div>
            )}
          </div>
        )}

        {transactions.length === 0 && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Points are earned when your event registrations are approved
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center pt-0">
        <Badge variant="secondary" className="text-xs gap-1">
          <Shield className="h-3 w-3" /> Secured by Blockchain
        </Badge>
      </CardFooter>
    </Card>
  );
} 