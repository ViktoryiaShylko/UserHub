'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ 
  title = "Ошибка", 
  message, 
  onRetry 
}: ErrorCardProps) {
  return (
    <Card className="border-red-500 border-2">
      <CardHeader>
        <CardTitle className="text-red-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
      {onRetry && (
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Повторить попытку
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}