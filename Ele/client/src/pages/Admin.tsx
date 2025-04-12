import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminComplaints from "@/components/admin/AdminComplaints";
import { format } from "date-fns";

// Define types for our data
interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface Order {
  id: number;
  customerName: string;
  email: string;
  createdAt: string;
  total: number;
  status: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState("orders");

  const { data: orders, isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchOnWindowFocus: false
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery<OrderStats>({
    queryKey: ['/api/admin/stats'],
    refetchOnWindowFocus: false
  });

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {!isStatsLoading && stats && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            }
          />
          <StatCard 
            title="Revenue" 
            value={`₹${(stats.totalRevenue / 100).toLocaleString()}`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/>
                <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/>
                <path d="M7 14v3"/>
                <path d="M17 14v3"/>
              </svg>
            }
          />
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            }
          />
        </div>
      )}
      
      <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          {isOrdersLoading ? (
            <div className="text-center p-6">Loading orders...</div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center p-6">No orders found.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.createdAt && format(new Date(order.createdAt), 'PP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{(order.total / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="complaints">
          <AdminComplaints />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status) {
    case "pending":
      variant = "secondary";
      break;
    case "processing":
      variant = "default";
      break;
    case "shipped":
      variant = "default";
      break;
    case "delivered":
      variant = "default";
      break;
    case "cancelled":
      variant = "destructive";
      break;
  }
  
  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}