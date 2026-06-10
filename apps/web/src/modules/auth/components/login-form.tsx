import { isAxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema, type TLoginForm } from '../schemas/auth.schema';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';

export function LoginForm() {
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const form = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (data: TLoginForm) => {
    setServerError('');

    try {
      const response = await authApi.login(data);

      setUser({
        userId: response.userId,
        role: response.role as 'seller' | 'admin',
        name: response.name,
        email: response.email,
      });

      if (response.role === 'seller') {
        await navigate({ to: '/seller/documents' });
      } else if (response.role === 'admin') {
        await navigate({ to: '/admin/documents' });
      }
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message
        : undefined;

      setServerError(message || 'Invalid email or password');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>DocVerify</CardTitle>
        <CardDescription>Document Verification Platform</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
