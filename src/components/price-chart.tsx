'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { priceService, type TokenPriceHistory } from '@/services/price-service'

interface PriceChartProps {
  mint: string
  symbol: string
  className?: string
  height?: number
}

type TimeRange = '1d' | '7d' | '30d'

export function PriceChart({ mint, symbol, className = '', height = 300 }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<TokenPriceHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')

  const timeRangeMap = {
    '1d': 1,
    '7d': 7,
    '30d': 30
  }

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const days = timeRangeMap[timeRange]
        const history = await priceService.getTokenPriceHistory(mint, days)
        
        if (history) {
          setPriceHistory(history)
        } else {
          setError('Price history not available')
        }
      } catch (err) {
        console.error('Error fetching price history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load price history')
      } finally {
        setLoading(false)
      }
    }

    fetchPriceHistory()
  }, [mint, timeRange])

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`
    } else {
      return `$${price.toFixed(6)}`
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    if (timeRange === '1d') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const chartData = priceHistory?.prices.map(point => ({
    timestamp: point.timestamp,
    price: point.price,
    formattedTime: formatTimestamp(point.timestamp)
  })) || []

  const isPositiveChange = (priceHistory?.priceChange24h || 0) >= 0

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {symbol} Price
            <Loader2 className="w-4 h-4 animate-spin" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading price data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !priceHistory) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{symbol} Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {error || 'Price data not available'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {symbol} Price
              <Badge variant={isPositiveChange ? "default" : "destructive"} className="gap-1">
                {isPositiveChange ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositiveChange ? '+' : ''}{priceHistory.priceChange24h.toFixed(2)}%
              </Badge>
            </CardTitle>
            <div className="text-2xl font-bold">
              {formatPrice(priceHistory.currentPrice)}
            </div>
          </div>
          
          <div className="flex gap-1">
            {(['1d', '7d', '30d'] as TimeRange[]).map(range => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="h-7 px-3 text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedTime"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                domain={['dataMin * 0.98', 'dataMax * 1.02']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-semibold">
                            {formatPrice(data.price)}
                          </span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositiveChange ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: isPositiveChange ? "#22c55e" : "#ef4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}