import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

// Complaint form schema
const complaintFormSchema = z.object({
  customerName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  customerEmail: z.string().email({ message: 'Please enter a valid email address.' }),
  customerPhone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  orderNumber: z.string().optional(),
  // We won't validate the file here since it's handled separately
});

type ContactFormValues = z.infer<typeof contactFormSchema>;
type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('contact');
  const [file, setFile] = useState<File | null>(null);
  const [submittedComplaintId, setSubmittedComplaintId] = useState<number | null>(null);
  
  // Get previously submitted complaints
  interface Complaint {
    id: number;
    status: string;
    subject: string;
    description: string;
    createdAt: string;
    response?: string;
  }
  
  const { data: complaints, isLoading: isComplaintsLoading, refetch: refetchComplaints } = useQuery<Complaint[]>({
    queryKey: ['/api/complaints'],
    refetchOnWindowFocus: false,
  });
  
  // Contact form
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });
  
  // Complaint form
  const complaintForm = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      subject: '',
      description: '',
      orderNumber: '',
    },
  });
  
  // Send a general contact message
  const onSubmit = (data: ContactFormValues) => {
    toast({
      title: 'Message sent!',
      description: 'We will get back to you as soon as possible.',
    });
    
    contactForm.reset();
  };
  
  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'The maximum file size is 5MB.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only images, PDFs, and documents are allowed.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };
  
  // Submit a complaint with optional file attachment
  const complaintMutation = useMutation({
    mutationFn: async (data: ComplaintFormValues) => {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Add file if present
      if (file) {
        formData.append('attachment', file);
      }
      
      return apiRequest('/api/complaints', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let the browser set it with the boundary
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Complaint submitted!',
        description: 'Thank you for your feedback. We will look into it.',
      });
      
      setSubmittedComplaintId(data.id);
      complaintForm.reset();
      setFile(null);
      refetchComplaints();
      
      // Reset file input
      const fileInput = document.getElementById('attachment') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: () => {
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your complaint. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const onComplaintSubmit = async (data: ComplaintFormValues) => {
    complaintMutation.mutate(data);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Vijay Electronics</h1>
        <p className="text-muted-foreground">
          Have questions or need help? We're here for you.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">+91 9611913391</p>
            <p className="text-sm text-muted-foreground mt-1">
              Monday to Saturday, 9AM to 9PM
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">support@vijayele.com</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll respond within 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Visit Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">Our Store</p>
            <p className="text-sm text-muted-foreground mt-1">
              123 Electronics Way, Tech Hub, Delhi - 110001
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="md:w-3/4 mx-auto">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="contact">Contact Form</TabsTrigger>
          <TabsTrigger value="complaint">File a Complaint</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={contactForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={contactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contactForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={contactForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us how we can help..." 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </Form>
          </div>
        </TabsContent>
        
        <TabsContent value="complaint">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold mb-4">Submit a Complaint</h2>
                
                <Form {...complaintForm}>
                  <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)} className="space-y-4">
                    <FormField
                      control={complaintForm.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={complaintForm.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={complaintForm.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 9902388878" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={complaintForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of your complaint" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="If related to an order, enter the order number" {...field} />
                          </FormControl>
                          <FormDescription>
                            If your complaint is related to a recent order, please enter the order number.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={complaintForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complaint Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide detailed information about your complaint..." 
                              className="min-h-[150px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel htmlFor="attachment" className="block mb-2">
                        Attachment (Optional)
                      </FormLabel>
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload images, PDFs, or documents related to your complaint. Max size: 5MB
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={complaintMutation.isPending}
                    >
                      {complaintMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Complaints</CardTitle>
                  <CardDescription>
                    Track the status of your previous complaints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isComplaintsLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : !complaints || complaints.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      You haven't submitted any complaints yet.
                    </div>
                  ) : (
                    complaints?.map((complaint) => (
                      <div 
                        key={complaint.id} 
                        className={`border rounded-lg p-3 ${submittedComplaintId === complaint.id ? 'border-primary' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{complaint.subject}</div>
                          <ComplaintStatusBadge status={complaint.status} />
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {complaint.createdAt && format(new Date(complaint.createdAt), 'PP')}
                        </div>
                        {complaint.response && (
                          <div className="mt-2 border-t pt-2">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Our Response:</div>
                            <div className="text-sm">{complaint.response}</div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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