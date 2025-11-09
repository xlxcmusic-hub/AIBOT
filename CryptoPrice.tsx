import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CryptoPriceProps {
  symbol: string;
  name: string;
}

export const CryptoPrice = ({ symbol, name }: CryptoPriceProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["crypto-price", symbol],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`
      );
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
    );
  }

  const price = data?.[symbol]?.usd;
  const change = data?.[symbol]?.usd_24h_change;
  const isPositive = change >= 0;

  return (
    <Card className="p-4 hover:bg-card/80 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase">{name}</p>
          <p className="text-2xl font-bold">${price?.toLocaleString()}</p>
        </div>
        <div className={cn("flex items-center gap-1", isPositive ? "text-success" : "text-destructive")}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          <span className="text-sm font-semibold">{Math.abs(change).toFixed(2)}%</span>
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}