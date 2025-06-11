
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface TopBottomSellersProps {
  data: SalesData[];
  type: 'product' | 'category' | 'member' | 'seller';
}

export const TopBottomSellers: React.FC<TopBottomSellersProps> = ({ data, type }) => {
  const getGroupedData = () => {
    const grouped = data.reduce((acc, item) => {
      let key = '';
      switch (type) {
        case 'product':
          key = item.cleanedProduct;
          break;
        case 'category':
          key = item.cleanedCategory;
          break;
        case 'member':
          key = item.customerName;
          break;
        case 'seller':
          key = item.soldBy;
          break;
      }
      
      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalValue: 0,
          unitsSold: 0,
          transactions: 0,
          atv: 0,
          auv: 0
        };
      }
      
      acc[key].totalValue += item.paymentValue;
      acc[key].unitsSold += 1;
      acc[key].transactions += 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate ATV and AUV
    Object.values(grouped).forEach((item: any) => {
      item.atv = item.totalValue / item.transactions;
      item.auv = item.totalValue / item.unitsSold;
    });
    
    return Object.values(grouped).sort((a: any, b: any) => b.totalValue - a.totalValue);
  };

  const groupedData = getGroupedData();
  const topSellers = groupedData.slice(0, 5);
  const bottomSellers = groupedData.slice(-5).reverse();

  const renderSellerCard = (sellers: any[], isTop: boolean) => (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isTop ? (
            <>
              <Award className="w-5 h-5 text-yellow-600" />
              Top Performers
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Bottom Performers
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sellers.map((seller, index) => (
          <div key={seller.name} className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm border">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isTop 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                  : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-slate-900 truncate max-w-32">{seller.name}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatNumber(seller.transactions)} txns
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ATV: {formatCurrency(seller.atv)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">{formatCurrency(seller.totalValue)}</p>
              <p className="text-xs text-slate-500">{formatNumber(seller.unitsSold)} units</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {renderSellerCard(topSellers, true)}
      {renderSellerCard(bottomSellers, false)}
    </div>
  );
};
