'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import FileUpload from '@/components/admin/file-upload';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'title must be at least 2 characters.'
  }),
  description: z.string().min(2, {
    message: 'description must be at least 2 characters.'
  }),
  document: z
    .array(z.instanceof(File))
    .nonempty('Please upload at least one file')
});

export default function AdminDocument() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      document: []
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      if (values.document) {
        formData.append('document', values.document[0]);
      }

      const res = await fetch('/api/document', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        toast('File uploaded successfully');
        form.reset();
      } else {
        toast('Failed to submit form');
      }
    } catch (error) {
      toast(`Submission error: ${error}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Files</FormLabel>
              <FormControl>
                <FileUpload onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
