
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export const ApprovalTimeline = () => {
  const timelineData = [
    { month: 'Jan', approvals: 45, rejections: 2 },
    { month: 'Fev', approvals: 52, rejections: 1 },
    { month: 'Mar', approvals: 38, rejections: 3 },
    { month: 'Abr', approvals: 61, rejections: 2 },
    { month: 'Mai', approvals: 48, rejections: 1 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Timeline de Aprovações
          <Badge variant="secondary">últimos 30 dias</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineData.map((data, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{data.month}</span>
              <div className="flex items-center gap-4 flex-1 mx-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(data.approvals / 70) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-green-600">{data.approvals}</span>
                <span className="text-sm text-red-600">{data.rejections}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>• Aprovadas</span>
          <span>• Rejeitadas</span>
        </div>
      </CardContent>
    </Card>
  );
};
