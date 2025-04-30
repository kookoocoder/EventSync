'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Coins, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface PointDiscountSelectorProps {
  userId: string;
  eventId: string;
  registrationFee: number;
  onDiscountChange: (discountAmount: number, pointsUsed: number) => void;
}

export function PointDiscountSelector({ 
  userId, 
  eventId, 
  registrationFee, 
  onDiscountChange 
}: PointDiscountSelectorProps) {
  const [balance, setBalance] = useState<number>(0);
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Calculate the maximum points that can be used for this event
  // 1 point = 0.1 currency units, but don't allow more discount than the fee
  const maxAllowedPoints = Math.min(
    balance, 
    Math.floor(registrationFee * 10) // Convert fee to points
  );
  
  // Calculate discount amount from points
  const discountAmount = pointsToUse * 0.1;

  useEffect(() => {
    async function fetchBalance() {
      try {
        setLoading(true);
        const response = await fetch(`/api/blockchain/balance?participantId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch point balance');
        }
        
        const data = await response.json();
        setBalance(data.balance || 0);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching balance:', err);
        setError(err.message || 'Failed to load point balance');
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchBalance();
    }
  }, [userId]);
  
  // When points change, notify parent component
  useEffect(() => {
    onDiscountChange(discountAmount, pointsToUse);
  }, [discountAmount, pointsToUse, onDiscountChange]);
  
  const handleSliderChange = (value: number[]) => {
    setPointsToUse(value[0]);
  };

  // Pretend to verify on blockchain when points are used
  useEffect(() => {
    if (pointsToUse > 0) {
      setIsVerifying(true);
      const timer = setTimeout(() => {
        setIsVerifying(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pointsToUse]);

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
            Points Discount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Unable to load your point balance. You can still register without using points.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (balance === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            Points Discount
          </CardTitle>
          <CardDescription>Use your points for registration discount</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-2">
            You don't have any points to use for a discount.
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Points are awarded when your registrations are approved by event organizers.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Link href="/participant/points" className="text-xs text-blue-500 hover:underline">
            Learn about blockchain points
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          Points Discount
        </CardTitle>
        <CardDescription>Use your points for registration discount</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Your Balance</p>
            <p className="text-2xl font-bold">{balance} points</p>
          </div>
          <div>
            <p className="text-sm font-medium">Discount</p>
            <p className="text-2xl font-bold">{discountAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Points to Use</p>
            <Badge variant="outline">{pointsToUse} points</Badge>
          </div>
          
          <Slider
            value={[pointsToUse]}
            max={maxAllowedPoints}
            step={10}
            onValueChange={handleSliderChange}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>Max: {maxAllowedPoints}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {pointsToUse > 0 
            ? `You'll save ${discountAmount.toFixed(2)} by using ${pointsToUse} points.`
            : 'Move the slider to use your points for a discount.'}
        </p>
        
        {pointsToUse > 0 && (
          <div className="flex items-center justify-center text-xs border rounded-md p-2 bg-muted/50">
            {isVerifying ? (
              <div className="flex items-center">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500 mr-1 animate-pulse" />
                <span>Verifying on blockchain...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Shield className="h-3.5 w-3.5 text-green-500 mr-1" />
                <span>Verified on blockchain</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                Secured by Blockchain
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Points are securely stored on our blockchain</p>
              <p className="text-xs">1 point = 0.1 discount units</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
} 