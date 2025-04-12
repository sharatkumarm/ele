import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define types for complaint data
interface Complaint {
  id: number;
  status: string;
  subject: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  orderNumber?: string;
  attachment?: string;
  attachmentName?: string;
  response?: string;
}

export default function AdminComplaints() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [responseTexts, setResponseTexts] = useState<{ [key: string]: string }>({});
  
  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['/api/admin/complaints'],
    refetchOnWindowFocus: false
  });
  
  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, status, response }: { id: number, status: string, response: string }) => {
      return apiRequest(`/api/admin/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, response }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/complaints'] });
      toast({
        title: "Status updated",
        description: "The complaint status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the complaint status. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleResponseChange = (id: number, text: string) => {
    setResponseTexts(prev => ({ ...prev, [id]: text }));
  };
  
  const handleStatusChange = (id: number, status: string) => {
    const response = responseTexts[id] || '';
    updateComplaintMutation.mutate({ id, status, response });
  };
  
  const handleSubmitResponse = (id: number, currentStatus: string) => {
    const response = responseTexts[id] || '';
    if (!response.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    updateComplaintMutation.mutate({ id, status: currentStatus, response });
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading complaints...</div>;
  }
  
  if (!complaints || complaints.length === 0) {
    return <div className="p-4 text-center">No complaints found.</div>;
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {complaints?.map((complaint) => (
        <Card key={complaint.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{complaint.subject}</CardTitle>
                <CardDescription>
                  From: {complaint.customerName} ({complaint.customerEmail})
                </CardDescription>
              </div>
              <ComplaintStatusBadge status={complaint.status} />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {complaint.createdAt && format(new Date(complaint.createdAt), 'PPP p')}
              {complaint.orderNumber && ` • Order #${complaint.orderNumber}`}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="bg-muted/50 p-3 rounded-md mb-3 whitespace-pre-wrap">
              {complaint.description}
            </div>
            
            {complaint.attachment && (
              <div className="mb-3">
                <a 
                  href={complaint.attachment} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                  {complaint.attachmentName || 'Attachment'}
                </a>
              </div>
            )}
            
            {complaint.response && (
              <div className="border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 p-3 rounded-md mb-3">
                <div className="text-sm font-medium mb-1">Our Response:</div>
                <div className="text-sm whitespace-pre-wrap">{complaint.response}</div>
              </div>
            )}
            
            <Textarea
              placeholder="Type your response here..."
              className="min-h-[100px] mb-3"
              value={responseTexts[complaint.id] || ''}
              onChange={(e) => handleResponseChange(complaint.id, e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleSubmitResponse(complaint.id, complaint.status)}
              disabled={updateComplaintMutation.isPending}
            >
              Send Response
            </Button>
            
            <Select
              value={complaint.status}
              onValueChange={(value) => handleStatusChange(complaint.id, value)}
              disabled={updateComplaintMutation.isPending}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ComplaintStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status) {
    case "open":
      variant = "destructive";
      break;
    case "in-progress":
      variant = "secondary";
      break;
    case "resolved":
      variant = "default";
      break;
    case "closed":
      variant = "outline";
      break;
  }
  
  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </Badge>
  );
}